# Aquatracking - Server

[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-%23FE5196?logo=conventionalcommits&logoColor=white)](https://conventionalcommits.org)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=aquatracking_server&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=aquatracking_server)

## Installation for development

### Requirements

- [Docker](https://www.docker.com)
- [Bun](https://bun.sh)

### Setup

Setup the environment variables:

```bash
cp .env.example .env
vim .env # or use your favorite editor to fill in the values
```

Install dependencies:

```bash
bun install
```

Start dev docker environment (database and maildev):

```bash
docker-compose up -d
```

Run the server:

```bash
bun dev
```

Access the server at `http://localhost:3000`.

## GIT

### Commit message convention

This project uses [Conventional Commits](https://www.conventionalcommits.org) for commit messages.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
