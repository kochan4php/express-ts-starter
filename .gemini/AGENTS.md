# Instructions for AI Agent — MongoDB to PostgreSQL Migration

## 1. Purpose
This document contains the working instructions that the AI agent must follow to migrate this service's default database from MongoDB to PostgreSQL. Follow every step in order and do not skip any stage.

## 2. Workflow

### 2.1 Understand the Service Context
- Read through the entire project structure (folders, configuration files, README if available).
- Understand the core function of the service: what it does, which endpoints are available, and how each endpoint interacts with MongoDB.
- Map out all models/schemas, collections, and queries currently used with MongoDB (including aggregation pipelines, indexes, and relations implemented at the application level).
- Identify the framework, ORM/ODM (e.g. Mongoose), and architecture currently in use before making any changes.
- Check `package.json` to understand the current dependencies and available scripts.

### 2.2 Design the PostgreSQL Schema
- Convert each MongoDB collection into an equivalent relational table.
- Define proper relationships (one-to-many, many-to-many, etc.) using foreign keys instead of embedded documents or references.
- Define primary keys, indexes, and constraints (unique, not null, foreign key) appropriately.
- Document any data structure that needs to be adjusted or normalized during the conversion from NoSQL to relational.

### 2.3 Update Dependencies
- This project uses **pnpm** as the package manager.
- Remove dependencies related to MongoDB (e.g. `mongoose`, `mongodb` driver) that are no longer used.
- Add dependencies required for PostgreSQL (e.g. a PostgreSQL driver/client and/or an ORM such as Prisma, Sequelize, TypeORM, or Knex — adjust to the existing project convention).
- Update other outdated dependencies to their latest stable versions as needed.
- Run `pnpm install` after the changes to make sure `pnpm-lock.yaml` is updated.
- Note: `pnpm-lock.yaml` is listed in `.gitignore`, so it will not be tracked or committed — no need to worry about staging or reviewing changes to the lock file.

### 2.4 Migrate the Code
- Replace all MongoDB models/schemas with their PostgreSQL equivalents (models/entities and migration files, according to the chosen ORM).
- Rewrite all queries that previously used MongoDB syntax (find, aggregate, populate, etc.) into SQL/ORM equivalents (SELECT with JOIN, etc.).
- Update environment variables/configuration for the database connection (connection string, host, port, credentials) to point to PostgreSQL.
- Make sure database migration files are created and can be run to set up the schema on a fresh PostgreSQL instance.

### 2.5 Run Testing
- Run tests using the scripts available in `package.json`.
- **Mandatory**: explicitly run the following script: `start:local:dev`
- Make sure the service runs without errors after the migration to PostgreSQL.
- Record and fix any errors or warnings that appear during testing.

### 2.6 Test Database Connectivity
- Run a `curl` request against one of the API endpoints that is directly related to the database.
- Make sure the response received is valid (status code as expected, returned data in the expected format, and consistent with data now stored in PostgreSQL).
- If an error occurs during the curl request, investigate the cause (database connection, query, migration, environment variables, etc.) before proceeding.

## 3. Important Rule

> **Do not ask for permission to commit and push first.**
> The AI agent is **prohibited** from committing and pushing to the repository before receiving an explicit instruction from the user.
> All changes should remain saved locally (working directory) until further instructions are given.

## 4. Workflow Summary

1. Understand the service context and map all existing MongoDB usage.
2. Design the equivalent PostgreSQL schema (tables, relations, constraints).
3. Update dependencies: remove MongoDB-related packages, add PostgreSQL-related packages via pnpm.
4. Migrate model/query code from MongoDB to PostgreSQL, including migration files.
5. Run testing via `package.json` scripts, specifically `start:local:dev`.
6. Curl one API endpoint related to the database to confirm the new PostgreSQL connection works properly.
7. Wait for an explicit instruction from the user before committing and pushing.