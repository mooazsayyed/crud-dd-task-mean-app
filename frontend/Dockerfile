# Stage 1: Build the Angular app
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy source code and build for production
COPY . .
RUN npx ng build --configuration production

# Stage 2: Serve with nginx
FROM nginx:alpine

# Copy built Angular app to nginx html directory
COPY --from=build /app/dist/angular-15-crud /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 8081
EXPOSE 8081

CMD ["nginx", "-g", "daemon off;"]