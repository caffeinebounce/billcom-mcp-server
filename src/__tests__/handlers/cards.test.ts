/**
 * Tests for Card handlers (v3 Spend API)
 * Tools: search_cards, get_card, create_virtual_card, freeze_card, unfreeze_card
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockCard } from '../setup.js';

// Mock the spendClient before importing handlers
vi.mock('../../clients/spend-client.js', () => ({
  spendClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    isConfigured: vi.fn().mockReturnValue(true),
    getBaseUrl: vi.fn().mockReturnValue('https://gateway.stage.bill.com/connect/v3/spend'),
    getEnvironment: vi.fn().mockReturnValue('sandbox'),
  },
}));

import { spendClient } from '../../clients/spend-client.js';
import { searchCards } from '../../handlers/search-cards.handler.js';
import { getCard } from '../../handlers/get-card.handler.js';
import { createVirtualCard } from '../../handlers/create-virtual-card.handler.js';
import { freezeCard } from '../../handlers/freeze-card.handler.js';
import { unfreezeCard } from '../../handlers/unfreeze-card.handler.js';

describe('Card Handlers (v3 Spend API)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('searchCards', () => {
    it('should search cards successfully', async () => {
      const mockCards = [
        createMockCard({ uuid: 'crd_1', lastFour: '4242' }),
        createMockCard({ uuid: 'crd_2', lastFour: '1234' }),
      ];
      (spendClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockCards);

      const result = await searchCards();

      expect(result.isError).toBe(false);
      expect(result.result).toHaveLength(2);
      expect(result.error).toBeNull();
    });

    it('should map uuid to id for backwards compatibility', async () => {
      const mockCards = [createMockCard({ uuid: 'crd_123' })];
      (spendClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockCards);

      const result = await searchCards();

      expect(result.isError).toBe(false);
      expect(result.result?.[0].id).toBe('crd_123');
    });

    it('should pass query parameters', async () => {
      (spendClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce([]);

      await searchCards({ limit: 10, cardType: 'virtual' });

      expect(spendClient.get).toHaveBeenCalledWith('cards', expect.objectContaining({
        limit: 10,
        cardType: 'virtual',
      }));
    });

    it('should pass status filter', async () => {
      (spendClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce([]);

      await searchCards({ status: 'active' });

      expect(spendClient.get).toHaveBeenCalledWith('cards', expect.objectContaining({
        status: 'active',
      }));
    });

    it('should pass userId filter', async () => {
      (spendClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce([]);

      await searchCards({ userId: 'usr_123' });

      expect(spendClient.get).toHaveBeenCalledWith('cards', expect.objectContaining({
        userId: 'usr_123',
      }));
    });

    it('should pass cursor for pagination', async () => {
      (spendClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce([]);

      await searchCards({ cursor: 'next_page_token' });

      expect(spendClient.get).toHaveBeenCalledWith('cards', expect.objectContaining({
        cursor: 'next_page_token',
      }));
    });

    it('should handle API errors', async () => {
      (spendClient.get as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Spend API error: Unauthorized')
      );

      const result = await searchCards();

      expect(result.isError).toBe(true);
      expect(result.error).toContain('Unauthorized');
    });

    it('should return empty array when no cards found', async () => {
      (spendClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce([]);

      const result = await searchCards();

      expect(result.isError).toBe(false);
      expect(result.result).toEqual([]);
    });
  });

  describe('getCard', () => {
    it('should get card by UUID successfully', async () => {
      const mockCard = createMockCard({ uuid: 'crd_123' });
      (spendClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockCard);

      const result = await getCard('crd_123');

      expect(result.isError).toBe(false);
      expect(result.result?.uuid).toBe('crd_123');
      expect(spendClient.get).toHaveBeenCalledWith('cards/crd_123');
    });

    it('should map uuid to id for backwards compatibility', async () => {
      const mockCard = createMockCard({ uuid: 'crd_123' });
      (spendClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockCard);

      const result = await getCard('crd_123');

      expect(result.isError).toBe(false);
      expect(result.result?.id).toBe('crd_123');
    });

    it('should handle card not found', async () => {
      (spendClient.get as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Spend API error: Card not found')
      );

      const result = await getCard('invalid_id');

      expect(result.isError).toBe(true);
      expect(result.error).toContain('Card not found');
    });

    it('should return complete card details', async () => {
      const mockCard = createMockCard({
        uuid: 'crd_123',
        lastFour: '4242',
        status: 'active',
      });
      (spendClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockCard);

      const result = await getCard('crd_123');

      expect(result.isError).toBe(false);
      expect(result.result?.lastFour).toBe('4242');
      expect(result.result?.status).toBe('active');
      expect(result.result?.cardholderName).toBeDefined();
    });
  });

  describe('createVirtualCard', () => {
    it('should create virtual card successfully', async () => {
      const mockCard = createMockCard({ uuid: 'crd_new' });
      (spendClient.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockCard);

      const result = await createVirtualCard({
        cardholderName: 'John Doe',
      });

      expect(result.isError).toBe(false);
      expect(result.result?.uuid).toBe('crd_new');
    });

    it('should pass all parameters correctly', async () => {
      const mockCard = createMockCard();
      (spendClient.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockCard);

      await createVirtualCard({
        cardholderName: 'John Doe',
        userId: 'usr_123',
        spendLimit: '5000.00',
        spendLimitPeriod: 'monthly',
        budgetId: 'bgt_456',
        vendorId: 'vnd_789',
        description: 'Travel card',
      });

      expect(spendClient.post).toHaveBeenCalledWith('cards', expect.objectContaining({
        cardType: 'virtual',
        cardholderName: 'John Doe',
        userId: 'usr_123',
        spendLimit: '5000.00',
        spendLimitPeriod: 'monthly',
        budgetId: 'bgt_456',
        vendorId: 'vnd_789',
        description: 'Travel card',
      }));
    });

    it('should handle validation errors', async () => {
      (spendClient.post as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Spend API error: Cardholder name is required')
      );

      const result = await createVirtualCard({
        cardholderName: '',
      });

      expect(result.isError).toBe(true);
      expect(result.error).toContain('Cardholder name is required');
    });

    it('should handle user not found', async () => {
      (spendClient.post as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Spend API error: User not found')
      );

      const result = await createVirtualCard({
        cardholderName: 'John Doe',
        userId: 'invalid_user',
      });

      expect(result.isError).toBe(true);
      expect(result.error).toContain('User not found');
    });

    it('should map uuid to id in response', async () => {
      const mockCard = createMockCard({ uuid: 'crd_new' });
      (spendClient.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockCard);

      const result = await createVirtualCard({
        cardholderName: 'John Doe',
      });

      expect(result.result?.id).toBe('crd_new');
    });

    it('should set cardType to virtual', async () => {
      const mockCard = createMockCard();
      (spendClient.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockCard);

      await createVirtualCard({
        cardholderName: 'John Doe',
      });

      expect(spendClient.post).toHaveBeenCalledWith('cards', expect.objectContaining({
        cardType: 'virtual',
      }));
    });
  });

  describe('freezeCard', () => {
    it('should freeze card successfully', async () => {
      const mockCard = createMockCard({ uuid: 'crd_123', status: 'frozen' });
      (spendClient.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockCard);

      const result = await freezeCard('crd_123');

      expect(result.isError).toBe(false);
      expect(result.result?.status).toBe('frozen');
      expect(spendClient.post).toHaveBeenCalledWith('cards/crd_123/freeze');
    });

    it('should handle card not found', async () => {
      (spendClient.post as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Spend API error: Card not found')
      );

      const result = await freezeCard('invalid');

      expect(result.isError).toBe(true);
      expect(result.error).toContain('Card not found');
    });

    it('should handle already frozen error', async () => {
      (spendClient.post as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Spend API error: Card is already frozen')
      );

      const result = await freezeCard('crd_frozen');

      expect(result.isError).toBe(true);
      expect(result.error).toContain('already frozen');
    });

    it('should handle cancelled card error', async () => {
      (spendClient.post as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Spend API error: Cannot freeze cancelled card')
      );

      const result = await freezeCard('crd_cancelled');

      expect(result.isError).toBe(true);
      expect(result.error).toContain('cancelled card');
    });

    it('should map uuid to id in response', async () => {
      const mockCard = createMockCard({ uuid: 'crd_123' });
      (spendClient.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockCard);

      const result = await freezeCard('crd_123');

      expect(result.result?.id).toBe('crd_123');
    });
  });

  describe('unfreezeCard', () => {
    it('should unfreeze card successfully', async () => {
      const mockCard = createMockCard({ uuid: 'crd_123', status: 'active' });
      (spendClient.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockCard);

      const result = await unfreezeCard('crd_123');

      expect(result.isError).toBe(false);
      expect(result.result?.status).toBe('active');
      expect(spendClient.post).toHaveBeenCalledWith('cards/crd_123/unfreeze');
    });

    it('should handle card not found', async () => {
      (spendClient.post as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Spend API error: Card not found')
      );

      const result = await unfreezeCard('invalid');

      expect(result.isError).toBe(true);
      expect(result.error).toContain('Card not found');
    });

    it('should handle not frozen error', async () => {
      (spendClient.post as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Spend API error: Card is not frozen')
      );

      const result = await unfreezeCard('crd_active');

      expect(result.isError).toBe(true);
      expect(result.error).toContain('not frozen');
    });

    it('should handle cancelled card error', async () => {
      (spendClient.post as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Spend API error: Cannot unfreeze cancelled card')
      );

      const result = await unfreezeCard('crd_cancelled');

      expect(result.isError).toBe(true);
      expect(result.error).toContain('cancelled card');
    });

    it('should map uuid to id in response', async () => {
      const mockCard = createMockCard({ uuid: 'crd_123' });
      (spendClient.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockCard);

      const result = await unfreezeCard('crd_123');

      expect(result.result?.id).toBe('crd_123');
    });
  });
});
