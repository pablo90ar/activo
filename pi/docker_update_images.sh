#!/bin/bash
docker compose down
docker pull pablo90ar/activo-backend:latest
docker pull pablo90ar/activo-frontend:latest
docker compose up -d
