#!/bin/bash
docker compose down
docker pull --platform linux/amd64 pablo90ar/activo-backend:latest
docker pull --platform linux/amd64 pablo90ar/activo-frontend:latest
docker compose up -d
