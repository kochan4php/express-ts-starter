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

## 4.1 Authorization Gate Pattern (Laravel-style)
Implement a centralized **Gate**, modeled after Laravel's `Gate`/`authorize()`, as an injectable class rather than scattering `if (user.role !== 'admin')` checks across services:
- Create an `@injectable() class Gate` in `common/authorization/gate.ts` with two core methods:
  - `define(ability: string, callback: (user: AuthUser, ...args: any[]) => boolean): void` — registers an ability and the rule that decides it.
  - `allows(ability: string, user: AuthUser, ...args: any[]): boolean` and `authorize(ability: string, user: AuthUser, ...args: any[]): void` — the latter throws a `ForbiddenError` (from `common/errors/`) when the check fails, so it plugs straight into the centralized error handler.
- Register every ability once at startup in a dedicated `common/authorization/abilities.ts` (equivalent to Laravel's `AuthServiceProvider::boot()`), e.g. `gate.define('update-post', (user, post) => user.id === post.authorId || user.role === 'admin')`. This keeps every authorization rule in one place instead of duplicated logic per service.
- Inject `Gate` into any service that needs it (constructor injection, per the DI standard) and call `this.gate.authorize('update-post', currentUser, post)` **as the first thing inside the relevant service method** — before any business logic or repository call runs. This is what guarantees the rule is enforced even if a route/controller-level guard is missing or misconfigured.
- Route/controller-level middleware (e.g. `@RequireAuth()` guard checking the JWT) still stays as the first line of defense for coarse checks (is the caller authenticated at all, does their role even exist) — the Gate is the second, more granular line of defense that understands the specific resource/business rule (e.g. "only the post's own author, or an admin, can update it"), which a route-level check typically can't express since it doesn't have the resource loaded yet.
- Keep ability names as simple, consistent strings (`'update-post'`, `'delete-user'`) shared via a `const` enum/object so they're type-checked and can't silently typo-mismatch between `define` and `authorize` calls.

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

### 11.1 SAST (Static Analysis)
- Use **Semgrep** as the primary SAST tool, run via `pnpm dlx semgrep --config auto --error` (or a pinned ruleset once the team settles on one) against `src/`.
- Add a dedicated `sast` script in `package.json` so it's runnable both locally and in CI the same way, consistent with the existing script convention (`start:local:dev`, `test`, `lint`, `build`).
- Also enable `eslint-plugin-security` as part of the existing `lint` step (see the starter standard), so common unsafe patterns (`eval`, unsafe regex, non-literal `require`, etc.) are caught even before the dedicated SAST stage runs.
- Fail the Jenkins build on any `ERROR`-severity Semgrep finding; `WARNING`-severity findings are reported but non-blocking initially, and can be tightened to blocking once the codebase baseline is clean.

### 11.2 Secrets Scanning
- Add a **secrets scanning** step (e.g. `gitleaks detect`) to the Jenkins pipeline, run against the diff/commit range being built, to catch accidentally committed credentials, tokens, or private keys before they reach a shared branch.
- This step must run even though `.env` and `pnpm-lock.yaml` are gitignored — secrets scanning protects against secrets leaking through other files (config, seed scripts, test fixtures), not just `.env`.
- Treat any secrets-scan finding as a **hard fail** — no severity threshold, no exceptions.

### 11.3 Dependency / SCA Scanning
- Run `pnpm audit --audit-level=high` as its own Jenkins stage (already referenced in the dependency-update standard) and fail the build on high/critical findings.
- Optionally add **Snyk** or **OSV-Scanner** for broader vulnerability database coverage beyond what `pnpm audit` reports.

### 11.4 Container Image Scanning
- Scan the built Docker image with **Trivy** (or equivalent) as a Jenkins stage right after the `Build` stage and before `Push`, so a vulnerable base image or OS package never reaches the registry.
- Fail the build on `HIGH`/`CRITICAL` image vulnerabilities with an available fix; findings without a fix yet can be logged and tracked instead of blocking.

### 11.5 DAST (Dynamic Analysis)
- Add an **OWASP ZAP baseline scan** stage that runs against a running instance of the service in a staging environment, after deployment to staging but before promotion to production.
- Point the scan at the OpenAPI spec generated for the Scalar documentation (see 11.6 / the API docs standard) so ZAP can automatically discover and test every documented endpoint instead of only crawling what it can reach by following links.
- Treat `HIGH`-risk ZAP alerts as a blocking gate for production promotion; `MEDIUM`/`LOW` findings are reported for review.

### 11.6 OpenAPI Spec as the Security Testing Source of Truth
- Since the service already maintains an OpenAPI spec for Scalar (per the API documentation standard), reuse that same spec as input for the DAST scan (11.5) and, where supported, for contract-based security testing (e.g. checking that documented auth requirements are actually enforced on every endpoint).
- Keep the spec accurate and up to date as a prerequisite for these scans to be meaningful — an outdated spec means ZAP tests the wrong surface.

### 11.7 Pipeline Gating Summary
All of the following must pass before a build can be deployed to production, consistent with how the Jenkinsfile already gates on `test` and `lint`:
1. `test` (unit + integration)
2. `lint` (including `eslint-plugin-security` and TypeScript type-check)
3. `sast` (Semgrep)
4. secrets scan (gitleaks) — hard fail on any finding
5. `pnpm audit` (dependency/SCA)
6. container image scan (Trivy)
7. DAST (OWASP ZAP baseline, staging only, gates promotion to production)

## 12. Important Rule

> **Do not ask for permission to commit and push first.**
> The AI agent is **prohibited** from committing and pushing to the repository before receiving an explicit instruction from the user.
> All changes should remain saved locally (working directory) until further instructions are given.

## 13. Summary
1. Apply secure HTTP headers via `helmet`, including a strict CSP and HSTS.
2. Validate all input with `zod` DTOs and use parameterized queries only — no raw string-built queries.
3. Hash passwords properly, use short-lived JWTs, and enforce authorization via a centralized Gate class at the service layer, not just route-level guards.
4. Rate-limit public endpoints and protect against brute force on auth endpoints.
5. Lock down CORS to an explicit origin whitelist.
6. Keep all secrets out of the codebase and out of logs.
7. Run dependency vulnerability scans (`pnpm audit`) and keep dependencies current.
8. Return generic error responses in production; log security events with enough context internally.
9. Enforce HTTPS, run containers as non-root, and restrict Kubernetes capabilities/network exposure.
10. Gate every production deployment on: `test`, `lint` (with security rules), Semgrep SAST, gitleaks secrets scan, `pnpm audit`, Trivy container scan, and an OWASP ZAP DAST scan driven by the OpenAPI/Scalar spec.
11. Wait for an explicit instruction from the user before committing and pushing.