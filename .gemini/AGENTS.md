# Instructions for AI Agent — Security Hardening Standard (Express + TypeScript)

## 1. Purpose
This document defines the baseline security controls that must be implemented in every microservice, covering the areas most commonly checked during a penetration test. Apply this standard together with the layered architecture, class-based implementation, and Kubernetes/CI standards already defined in the other AGENTS documents.

## 2. HTTP Security Headers
- Use `helmet` middleware to set secure defaults (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, etc.).
- Configure a strict **Content-Security-Policy (CSP)** appropriate for the service (deny by default, allow only what's actually needed).
- Enforce **HSTS** (`Strict-Transport-Security`) when the service is served over HTTPS.
- Remove/disable the `X-Powered-By` header so the framework/version isn't disclosed to an attacker.

## 3. Input Validation & Injection Prevention
- Every request input (body, query, params, headers used in logic) must be validated with the `zod` DTO schema defined in the module, as already required by the starter standard — reject anything that doesn't match, don't just "best effort" sanitize.
- Never build SQL/NoSQL queries via raw string concatenation or template literals with user input. Always use parameterized queries / the ORM's query builder inside the repository layer.
- Sanitize any user input that will be rendered back as HTML to prevent stored/reflected XSS (escape by default; only allow rich text through an explicit, allow-listed sanitizer if the feature truly needs it).
- Validate and restrict file uploads: enforce file type (by content, not just extension), max file size, and store uploaded files outside any web-executable path.

## 4. Authentication & Authorization
- Hash passwords with a modern algorithm (`argon2` or `bcrypt` with an adequate cost factor) — never store plaintext or use a fast general-purpose hash (MD5/SHA1/SHA256 alone).
- Use short-lived JWT access tokens plus a refresh token strategy; sign tokens with a strong secret/key stored in a secrets manager, not committed to the repo.
- Validate the token signature, expiry, and issuer/audience claims on every protected request — implement this check as a class-based middleware/guard, consistent with the class-based standard.
- Enforce authorization checks (role/permission-based) at the service layer, not only at the route/controller layer, so business logic can never be reached by an unauthorized caller even if a route-level check is missed.
- Apply the principle of least privilege for any service-to-service or database credential used by the microservice.

## 5. Rate Limiting & Abuse Protection
- Apply `express-rate-limit` (or equivalent) on all public-facing endpoints, with stricter limits on sensitive endpoints (login, password reset, OTP).
- Implement account lockout or exponential backoff after repeated failed login attempts to mitigate brute-force attacks.
- Set reasonable request body size limits (`express.json({ limit: ... })`) to prevent large-payload DoS.

## 6. CORS Configuration
- Explicitly whitelist allowed origins — never use a wildcard (`*`) for endpoints that accept credentials/cookies.
- Restrict allowed methods and headers to only what the service actually needs.

## 7. Secrets & Configuration Management
- No secrets, API keys, database credentials, or tokens hardcoded anywhere in the codebase — all must come from environment variables or a secrets manager (e.g. Kubernetes Secrets, Vault), consistent with the config standard already defined.
- Rotate secrets regularly and never log them (see Section 9).
- `.env` files must never be committed; only `.env.example` (with placeholder values) is tracked in git.

## 8. Dependency & Supply Chain Security
- Run `pnpm audit` (or an equivalent SCA tool) as part of the CI pipeline and fail the build on high/critical vulnerabilities.
- Keep dependencies up to date, consistent with the dependency-update standard already defined for this service.
- Pin dependency versions and verify the integrity of `pnpm-lock.yaml` in CI even though the lock file itself is gitignored locally — regenerate and audit it during the CI build step.

## 9. Logging, Error Handling & Information Disclosure
- Never log sensitive data: passwords, tokens, full card numbers, or other PII in plaintext.
- In production, return generic error messages to the client (via the centralized error handler already defined) — never leak stack traces, internal file paths, or query details in the API response.
- Log security-relevant events (failed logins, authorization failures, rate-limit hits) with enough context for later investigation, using the standard logger.

## 10. Transport & Infrastructure Security
- Enforce HTTPS/TLS for all external traffic; redirect HTTP to HTTPS at the ingress/load balancer level.
- Run containers as a **non-root user** and use a minimal base image (e.g. `node:XX-alpine` or distroless) to reduce attack surface, consistent with the Kubernetes standard already defined.
- Set Kubernetes `securityContext` to disallow privilege escalation and drop unnecessary Linux capabilities.
- Keep the database and internal services unreachable from outside the cluster network — only expose what genuinely needs to be public.

## 11. Security Testing in CI/CD
- Add a SAST (static analysis) step to the Jenkins pipeline (e.g. Semgrep, ESLint security plugin) to catch common vulnerability patterns automatically on every build.
- Where feasible, add a DAST scan (e.g. OWASP ZAP baseline scan) against a running instance of the service in a staging environment as part of the pipeline.
- Treat these scans as a required gate before deployment to production, consistent with how the Jenkinsfile already gates on tests and lint.

## 12. Important Rule

> **Do not ask for permission to commit and push first.**
> The AI agent is **prohibited** from committing and pushing to the repository before receiving an explicit instruction from the user.
> All changes should remain saved locally (working directory) until further instructions are given.

## 13. Summary
1. Apply secure HTTP headers via `helmet`, including a strict CSP and HSTS.
2. Validate all input with `zod` DTOs and use parameterized queries only — no raw string-built queries.
3. Hash passwords properly, use short-lived JWTs, and enforce authorization at the service layer.
4. Rate-limit public endpoints and protect against brute force on auth endpoints.
5. Lock down CORS to an explicit origin whitelist.
6. Keep all secrets out of the codebase and out of logs.
7. Run dependency vulnerability scans (`pnpm audit`) and keep dependencies current.
8. Return generic error responses in production; log security events with enough context internally.
9. Enforce HTTPS, run containers as non-root, and restrict Kubernetes capabilities/network exposure.
10. Add SAST/DAST scanning as a required gate in the Jenkins pipeline.
11. Wait for an explicit instruction from the user before committing and pushing.