#!/bin/bash
cd ..
echo "Building images locally for ARM architecture..."

echo "Building backend..."
cd back
docker build -t pablo90ar/activo-backend:latest .

echo "Building frontend..."
cd front
docker build -t pablo90ar/activo-frontend:latest .

echo "Local build complete!"