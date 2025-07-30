FROM node:22-alpine as build

WORKDIR /app

# Copy package files first for better Docker layer caching
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:stable-alpine

# Copy built application
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Add labels for better maintainability
LABEL maintainer="your-email@example.com"
LABEL description="React Frontend Application"

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]