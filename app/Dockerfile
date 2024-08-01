FROM node:18 AS builder

# Definir o diretório de trabalho
WORKDIR /app

COPY . .

# Definir o contêiner final
FROM node:18

# Definir o diretório de trabalho
WORKDIR /app

# Expor a porta que o Tauri usa
EXPOSE 3000