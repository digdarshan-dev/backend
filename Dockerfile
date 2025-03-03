# Use a Node.js base image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy monorepo-level package files
COPY package.json package-lock.json lerna.json ./

# Install root dependencies
RUN npm install

# Copy all source code (including shared and packages)
COPY . .

# Install dependencies for each microservice
RUN npx lerna exec -- npm install

# Build all packages (if needed)
RUN npx lerna run build --stream || echo "Build step skipped"

# Expose necessary ports (adjust based on your microservices)
EXPOSE 5001 5002

# Start all microservices
CMD ["npm", "run", "start"]
