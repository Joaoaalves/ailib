# embedding/Dockerfile
FROM python:3.9-slim

# Define o diretório de trabalho
WORKDIR /api

# Copia os arquivos de requisitos e instala as dependências
COPY requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copia o código-fonte
COPY src/ src/

# Define o comando a ser executado no container
CMD ["python", "src/__init__.py"]