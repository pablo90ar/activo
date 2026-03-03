# Build stage
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

# Install lightningcss binary for ARM if needed
RUN if [ "$(uname -m)" = "aarch64" ]; then \
    npm install lightningcss-linux-arm64-musl; \
fi

COPY . .
RUN npm run build

# Serve stage
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]