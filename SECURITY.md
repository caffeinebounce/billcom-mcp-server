# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability, please report it by emailing security@caffeinebounce.com rather than opening a public issue.

Please include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Any suggested fixes

We will acknowledge receipt within 48 hours and provide a detailed response within 7 days.

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.x.x   | :white_check_mark: |

## Security Best Practices

When using this MCP server:

1. **Never commit credentials**: Use environment variables or `.env` files (which are gitignored)
2. **Use sandbox for development**: Bill.com provides sandbox environments
3. **Restrict API permissions**: Use the minimum required permissions for your Bill.com API credentials
4. **Keep dependencies updated**: Regularly update npm dependencies

## Credential Handling

This server requires Bill.com API credentials. These should be provided via environment variables:

- `BILLCOM_DEV_KEY` - Your Bill.com developer key
- `BILLCOM_USERNAME` - Your Bill.com username
- `BILLCOM_PASSWORD` - Your Bill.com password
- `BILLCOM_ORG_ID` - Your Bill.com organization ID
- `BILLCOM_API_TOKEN` - Your Bill.com v3 API token (for Spend API)

Never hardcode these values or commit them to version control.
