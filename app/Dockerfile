# Use the official Node.js image as the base image
FROM node:18

# Install necessary dependencies for Tauri
RUN apt-get update && apt-get install -y \
    libwebkit2gtk-4.0-dev \
    build-essential \
    libssl-dev \
    libgtk-3-dev \
    curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Rust
RUN curl https://sh.rustup.rs -sSf | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"

# Install Tauri CLI
RUN cargo install tauri-cli

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port that the Next.js app runs on
EXPOSE 3000

# Set the command to run the Next.js app and Tauri in development mode
CMD ["sh", "-c", "npm run tauri dev"]

