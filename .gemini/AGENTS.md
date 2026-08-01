# Instructions for AI Agent — API Documentation with Scalar

## 1. Purpose
This document contains the working instructions that the AI agent must follow to create API documentation for this service using Scalar. Follow every step in order and do not skip any stage.

## 2. Workflow

### 2.1 Understand the Service Context
- Read through the entire project structure (folders, configuration files, README if available).
- Identify all API endpoints available in the service: routes, HTTP methods, request payloads, query/path parameters, headers, and response formats (including error responses).
- Check whether an OpenAPI/Swagger spec already exists in the project. If it exists, use it as the base and update it as needed. If it doesn't exist, generate one from the codebase.
- Identify the framework used, and check whether there's already a mechanism to auto-generate the OpenAPI spec (e.g. via decorators/annotations, route schema validation, or existing Swagger setup) before writing one manually.

### 2.2 Build/Update the OpenAPI Specification
- Write or update the OpenAPI (v3) specification file (`openapi.yaml` or `openapi.json`) covering all endpoints.
- For each endpoint, document: summary/description, tags/grouping, parameters, request body schema, response schema for each status code, and authentication requirements (if any).
- Make sure schemas are reusable via `components/schemas` to avoid duplication.
- Keep example values realistic and consistent with the actual data structure used by the service.

### 2.3 Update Dependencies
- This project uses **pnpm** as the package manager.
- Add the required Scalar package for API reference UI (e.g. `@scalar/express-api-reference`, `@scalar/nestjs-api-reference`, or the appropriate package based on the framework used).
- Run `pnpm install` after the changes to make sure `pnpm-lock.yaml` is updated.
- Note: `pnpm-lock.yaml` is listed in `.gitignore`, so it will not be tracked or committed — no need to worry about staging or reviewing changes to the lock file.

### 2.4 Integrate Scalar
- Set up a route/endpoint (e.g. `/docs` or `/reference`) that serves the Scalar API reference UI, pointed at the OpenAPI spec file created in step 2.2.
- Configure basic Scalar appearance/theme settings if the project already has branding guidelines, otherwise use the default theme.
- Make sure the documentation route is only exposed according to the project's convention (e.g. available in local/dev, and follow existing rules if it needs to be restricted in production).

### 2.5 Run Testing
- Run tests using the scripts available in `package.json`.
- **Mandatory**: explicitly run the following script: `start:local:dev`
- Make sure the service runs without errors and the Scalar documentation route can be accessed and renders the API reference correctly.
- Record and fix any errors or warnings that appear during testing.

### 2.6 Test Database Connectivity
- Run a `curl` request against one of the API endpoints that is directly related to the database.
- Make sure the response received is valid (status code as expected, returned data in the expected format) and matches what is documented in the OpenAPI spec.
- If an error occurs during the curl request, investigate the cause before proceeding.

## 3. Important Rule

> **Do not ask for permission to commit and push first.**
> The AI agent is **prohibited** from committing and pushing to the repository before receiving an explicit instruction from the user.
> All changes should remain saved locally (working directory) until further instructions are given.

## 4. Workflow Summary

1. Understand the service context and identify all existing API endpoints.
2. Build or update the OpenAPI specification covering all endpoints.
3. Update dependencies: add the Scalar package via pnpm.
4. Integrate Scalar to serve the API reference UI from the OpenAPI spec.
5. Run testing via `package.json` scripts, specifically `start:local:dev`.
6. Curl one API endpoint related to the database to confirm the documented behavior matches the actual response.
7. Wait for an explicit instruction from the user before committing and pushing.