# Bau-Structura August

This repository contains the full source for the Bau-Structura application.

## Prerequisites

- **Node.js** v20 or newer
- A `.env` file with the following variables (see `.env.example` for values):

```
DATABASE_URL=
SESSION_SECRET=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SENDER_EMAIL=
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
OPENAI_API_KEY=
AZURE_STORAGE_ACCOUNT_NAME=
AZURE_STORAGE_ACCOUNT_KEY=
AZURE_STORAGE_CONTAINER_NAME=
HETZNER_SSH_KEY=
HETZNER_SSH_USER=
SFTP_HOST=
SFTP_PORT=
NODE_ENV=
PORT=
```

## Installing dependencies

```bash
npm install
```

## Running the development server

```bash
npm run dev
```

## Executing tests

### Vitest

```bash
npx vitest
```

### Playwright

```bash
npx playwright test
```

## Building production artifacts

```bash
npm run build
```

Use `npm start` to run the built server.
