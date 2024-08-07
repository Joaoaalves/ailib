# AI LIB

### Quickstart

1- Install RUST and Tauri dependencies:
[Tauri Quick Start](https://tauri.app/v1/guides/getting-started/setup/)

2- Install Docker:
[Docker Quick Start](https://www.docker.com/get-started/)

3- Set the MYSQL vars on docker-compose.yml

4- Run QDrant, MYSQL and Adminer:

```shell
docker-compose up --build -d
```

5- Run Tauri:

```shell
cd app/
npm run tauri dev
```
