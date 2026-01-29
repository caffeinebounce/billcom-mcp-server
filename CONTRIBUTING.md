# Contributing to Bill.com MCP Server

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/billcom-mcp-server.git`
3. Install dependencies: `npm install`
4. Create a branch: `git checkout -b feature/your-feature-name`

## Development Setup

1. Copy `.env.example` to `.env` and configure your Bill.com credentials (sandbox recommended for development)
2. Build the project: `npm run build`
3. Run tests: `npm test`

## Code Standards

- **TypeScript**: All code must be written in TypeScript with proper types
- **Formatting**: Follow existing code style
- **Tests**: New features should include tests; bug fixes should include regression tests
- **Documentation**: Update README.md if adding new tools or changing behavior

## Pull Request Process

1. Ensure your code builds without errors: `npm run build`
2. Ensure all tests pass: `npm test`
3. Update documentation as needed
4. Create a pull request with a clear description of changes
5. Link any related issues

## Adding New Tools

When adding new Bill.com API tools:

1. Create the tool definition in `src/tools/`
2. Create the handler in `src/handlers/`
3. Register the tool in `src/index.ts`
4. Add tests in `src/__tests__/`
5. Update README.md with the new tool

## API Documentation

- [Bill.com v2 AP API](https://developer.bill.com/docs/api/)
- [Bill.com v3 Spend API](https://developer.bill.com/docs/spend/)

## Reporting Issues

- Use GitHub Issues for bug reports and feature requests
- Include reproduction steps for bugs
- Include Bill.com API version (v2 or v3) if relevant

## Code of Conduct

Be respectful and constructive. We're all here to build something useful.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
