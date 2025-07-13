# Minimal Node.js container - Alpine for minimal vulnerabilities
FROM node:22-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for building)
RUN npm i

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application directly with node
CMD ["node", "dist/server.js"]