# Albion Raid Manager

A comprehensive Discord bot and web application for managing Albion Online raids and guild activities.

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 20+ and pnpm

### Development Setup

Use Docker for infrastructure and Turbo for applications:

1. **Start infrastructure services:**

   ```bash
   pnpm infra:up
   ```

2. **Start applications locally:**

   ```bash
   # Start all applications
   pnpm dev

   # Or start individual applications
   pnpm api    # API server
   pnpm web    # Web application
   pnpm bot    # Discord bot
   ```

3. **Access the services:**
   - Web App: http://localhost:5173
   - API: http://localhost:3001
   - Database Admin: http://localhost:8080
   - Redis Admin: http://localhost:8081

4. **Infrastructure management:**

   ```bash
   pnpm infra:logs      # View infrastructure logs
   pnpm infra:status    # Check infrastructure status
   pnpm infra:down      # Stop infrastructure
   pnpm infra:reset     # Reset infrastructure (removes all data)
   ```

### Local Development

1. **Install dependencies:**

   ```bash
   pnpm install
   ```

2. **Set up environment variables:**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start infrastructure (if using hybrid approach):**

   ```bash
   pnpm infra:up
   ```

4. **Start services:**

   ```bash
   # Start all services
   pnpm dev

   # Start individual services
   pnpm api    # API server
   pnpm web    # Web application
   pnpm bot    # Discord bot
   ```

## Project Structure

- **apps/api** - Express.js REST API
- **apps/web** - React + Vite frontend
- **apps/bot** - Discord.js bot
- **packages/core** - Shared business logic, Discord services, configuration, and logging
- **packages/database** - Prisma database schema
- **packages/ai** - AI/ML utilities

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with Turbo: `pnpm dev`
5. Submit a pull request

## Code Agent Standards

**Important:** For all Code Agent prompts (including Copilot, AI agents, and automation tools), always read the contents of the markdown files in `.cursor/rules` before executing any tasks. These files define the project standards, best practices, and conventions for this repository. Agents should use these rules to guide all code generation, refactoring, and automation.

## License

[Add your license here]
