#!/bin/bash
docker buildx use multiarch

cd ..
echo "Building images locally for ARM architecture..."

echo "Building backend..."
cd back
docker buildx build --platform linux/arm/v8 -t pablo90ar/activo-backend:latest . --push


cd ..

echo "Building frontend..."
cd front
docker buildx build --platform linux/arm/v8 -t pablo90ar/activo-frontend:latest . --push


echo "Local build complete!"