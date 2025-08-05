This is a `discord.js` project made for standalobe node.

# Getting started

## Configuration & Environment Variables

This project can be configures both using `.env` file or managing configuration files.

Check `.env.example` file to see what environment variables are available or create a custom config at `config/local.ts` to override any setting.

## Install dependencies

This package uses `pnpm` to manage its dependencies. Install by using the following command:

```
pnpm install
```

## Run the bot

This script starts the bot in development mode using `pnpm`.

```
pnpm start:dev
```

## Bot Commands

### Configuration Commands

The bot provides several configuration commands for server administrators:

#### `/config roles`

Configure server roles for member management:

- `member-role` (optional): Role for server members (guild members)
- `friend-role` (optional): Role for friends (non-guild members)

#### `/config guild`

Configure Albion guild ID for automatic role assignment:

- `guild-id` (required): Albion guild ID to match against

#### `/config audit`

Configure audit channel for bot events:

- `channel` (optional): Channel to send audit messages to

#### `/config raid`

Configure raid announcement channel:

- `channel` (optional): Channel to send raid announcements to

#### `/config view`

View current server configuration including all configured roles, guild ID, audit channel, and raid channel.

### Registration Commands

#### `/register`

Register your Albion Online character with the bot for automatic role assignment.

## Permissions

All configuration commands require Administrator permissions to use.
