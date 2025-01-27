# Eliza

## Prerequisites
### Postgres Database Setup
This project requires a Postgres database with the pgvector extension. For detailed instructions on setting up Postgres with pgvector on Fly.io, please refer to the [setup guide](postgres-docker-config/README.md).

## Edit the character files

Open `src/character.ts` to modify the default character. Uncomment and edit.

### Custom characters

To load custom characters instead:
- Use `pnpm start --characters="path/to/your/character.json"`
- Multiple character files can be loaded simultaneously

### Add clients
```
# in character.ts
clients: [Clients.TWITTER, Clients.DISCORD],

# in character.json
clients: ["twitter", "discord"]
```

## Environment Setup

### Required Environment Variables
The following environment variables are required for the application to run:

```bash
# Core Variables (Required)
DAEMON_PROCESS=true        # Important: Must be true in production to disable interactive mode
SERVER_PORT=3000          # The port your service will run on
DATABASE_URL             # Your PostgreSQL database connection string

# Model Provider (At least one required)
OPENAI_API_KEY          # OpenAI API key for GPT models
# OR
OPENROUTER_API_KEY      # OpenRouter API key for alternative models

# Optional Client-Specific Variables (Required if using specific clients)
DISCORD_APPLICATION_ID  # Required for Discord integration
DISCORD_API_TOKEN      # Required for Discord bot functionality
TELEGRAM_BOT_TOKEN     # Required for Telegram bot functionality
GITBOOK_SPACE_ID       # Required for Gitbook integration
```

### Development Setup
1. Duplicate the .env.example template:
```bash
cp .env.example .env
```

2. Fill out the .env file with your own values.

### Production Deployment
When deploying to production (e.g., Fly.io), ensure these minimum environment variables are set:

## Install dependencies and start your agent

```bash
pnpm i && pnpm start
```
Note: this requires node to be at least version 22 when you install packages and run the agent.

## Run with Docker

### Build and run Docker Compose (For x86_64 architecture)

#### Edit the docker-compose.yaml file with your environment variables

```yaml
services:
    eliza:
        environment:
            - OPENROUTER_API_KEY=blahdeeblahblahblah
```

#### Run the image

```bash
docker compose up
```

### Build the image with Mac M-Series or aarch64

Make sure docker is running.

```bash
docker buildx build --platform linux/amd64 -t eliza-starter:v1 .
```

#### Edit the docker-compose-image.yaml file with your environment variables

```yaml
services:
    eliza:
        environment:
            - OPENROUTER_API_KEY=blahdeeblahblahblah
```

#### Run the image

```bash
docker compose -f docker-compose-image.yaml up
```

## Memory Requirements

The application requires a minimum of 2GB RAM to run properly. For production environments, it's recommended to:
- Use at least 2GB RAM per instance
- Or enable multiple machines with load balancing if using smaller memory configurations

You can adjust memory in Fly.io using:
```bash
fly scale memory 2048  # Scales to 2GB RAM
```