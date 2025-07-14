# Backend Docker Deployment

Simple Docker setup for the Langara Scraper backend.

## Quick Start

1. **Create `.env` file** with your MongoDB Atlas connection:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
   ```

2. **Run with Docker Compose:**
   ```bash
   docker-compose up
   ```

3. **Your API will be available at:** `http://localhost:3000`

## What it includes

- **Node.js 22 Alpine** - Minimal and secure base image
- **Production build** - TypeScript compiled to JavaScript
- **MongoDB Atlas connection** - Uses your `.env` file
- **Auto-restart** - Container restarts if it crashes
- **Course scheduler** - Runs automatically every hour

## Commands

```bash
# Start in foreground (see logs)
docker-compose up

# Start in background
docker-compose up -d

# Stop containers
docker-compose down

# Rebuild and start (after code changes)
docker-compose up --build

# View logs
docker-compose logs -f
```

## How it works

The Docker setup:
1. Installs all dependencies (including TypeScript)
2. Builds your TypeScript code to JavaScript
3. Runs the compiled `dist/server.js` file
4. Connects to MongoDB Atlas using your `.env` file
5. Starts the course scheduler automatically

Perfect for both development testing and production deployment!
