# Build stage
FROM node:18-alpine AS builder

WORKDIR /build

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build Angular app for production
RUN npm run build -- --configuration production

# Runtime stage
FROM nginx:alpine

# Install dumb-init for signal handling
RUN apk add --no-cache dumb-init

# Create non-root user for nginx
RUN addgroup -g 1001 -S www-user && \
    adduser -S www-user -u 1001

# Copy custom nginx config
RUN mkdir -p /etc/nginx/conf.d

COPY nginx.conf /etc/nginx/nginx.conf
COPY default.conf /etc/nginx/conf.d/default.conf

# Copy built application from builder stage
COPY --from=builder --chown=1001:1001 /build/dist/angular-15-crud /usr/share/nginx/html

# Create necessary directories with proper permissions
RUN mkdir -p /var/cache/nginx /var/run/nginx && \
    chown -R 1001:1001 /var/cache/nginx /var/run/nginx /var/log/nginx /usr/share/nginx/html /etc/nginx

# Set permissions for nginx configuration
RUN chmod 644 /etc/nginx/nginx.conf && \
    chmod 644 /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 8081

# Switch to non-root user
USER www-user

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8081/ || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT [ "/usr/sbin/dumb-init", "--" ]

# Start nginx
CMD [ "nginx", "-g", "daemon off;" ]
