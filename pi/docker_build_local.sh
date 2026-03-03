#!/bin/bash
cd ..
echo "Building images locally for ARM architecture..."

echo "Building backend..."
cd back
docker build --platform linux/amd64,linux/arm64 -t pablo90ar/activo-backend:latest .

cd ..

echo "Building frontend..."
cd front
docker build --platform linux/amd64,linux/arm64 -t pablo90ar/activo-frontend:latest .

echo "Local build complete!"