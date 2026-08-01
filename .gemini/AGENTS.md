# Instructions for AI Agent

## 1. Purpose
This document contains the working instructions that the AI agent must follow when working on this service. Follow every step in order and do not skip any stage.

## 2. Workflow

### 2.1 Understand the Service Context
- Read through the entire project structure (folders, configuration files, README if available).
- Understand the core function of the service: what it does, which endpoints are available, and how it interacts with the database and other services.
- Identify the framework, programming language, and architecture being used before making any changes.
- Check the `package.json` file to understand the dependencies in use and the available scripts.

### 2.2 Update Dependencies
- Identify all dependencies in `package.json` that are outdated.
- Update those dependencies to the latest stable version (not beta/alpha, unless instructed otherwise).
- Make sure there are no unhandled breaking changes after the update. If breaking changes occur, adjust the affected code accordingly.
- This project uses **pnpm** as the package manager. Reinstall dependencies after the update using `pnpm install` to make sure `pnpm-lock.yaml` is updated as well.
- Note: `pnpm-lock.yaml` is listed in `.gitignore`, so it will not be tracked or committed — no need to worry about staging or reviewing changes to the lock file.

### 2.3 Run Testing
- Run tests using the scripts available in `package.json`.
- **Mandatory**: explicitly run the following script: `start:local:dev`
- Make sure the service runs without errors after the dependencies are updated.
- Record and fix any errors or warnings that appear during testing.

### 2.4 Test Database Connectivity
- Run a `curl` request against one of the API endpoints that is directly related to the database.
- Make sure the response received is valid (status code as expected, returned data in the expected format).
- If an error occurs during the curl request, investigate the cause (database connection, query, environment variables, etc.) before proceeding.

## 3. Important Rule

> **Do not ask for permission to commit and push first.**
> The AI agent is **prohibited** from committing and pushing to the repository before receiving an explicit instruction from the user.
> All changes should remain saved locally (working directory) until further instructions are given.

## 4. Workflow Summary

1. Understand the service context thoroughly.
2. Update outdated dependencies to the latest version.
3. Run testing via `package.json` scripts, specifically `start:local:dev`.
4. Curl one API endpoint related to the database to confirm the connection works properly.
5. Wait for an explicit instruction from the user before committing and pushing.