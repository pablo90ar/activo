#!/bin/bash
docker buildx use multiarch

cd ..
echo "Building images locally for ARM architecture..."

echo "Building backend..."
cd back
docker buildx build --platform linux/arm64,linux/arm/v8,linux/arm/v7 -t pablo90ar/activo-backend:latest .
docker push pablo90ar/activo-backend:latest


cd ..

echo "Building frontend..."
cd front
docker buildx build --platform linux/arm64,linux/arm/v8,linux/arm/v7 -t pablo90ar/activo-frontend:latest .
docker push pablo90ar/activo-backend:latest


echo "Local build complete!"