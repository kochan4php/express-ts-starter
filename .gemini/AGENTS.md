# Instructions for AI Agent — Microservice Starter Standard (Express + TypeScript)

## 1. Purpose
This document defines the standard structure and conventions that must be followed when scaffolding or building a new microservice using **Express with TypeScript**. The goal is to keep the codebase consistent across all microservices, even when built by different people or different AI agent sessions. This document should be treated as the base reference whenever a new service is created or an existing service is refactored to match the standard.

## 2. Layered Architecture
Every microservice must follow a consistent layered flow:

```
Route -> Controller -> Service -> Repository -> Database
```

- **Route**: defines the endpoint path, HTTP method, middleware chain (auth, validation), and maps it to a controller method. Implemented as a class (see 2.1), not as loose `router.get(...)` calls in a plain script. No business logic here.
- **Controller**: handles the HTTP request/response cycle only (parse input, call the service, format the response). No direct database access and no business logic here.
- **Service**: contains the business logic. Orchestrates one or more repositories, applies rules/validation that go beyond simple input shape checking.
- **Repository**: the only layer allowed to talk to the database. Encapsulates queries so the service layer never depends on a specific ORM/driver syntax directly.

## 2.1 Class-Based Implementation (Mandatory)
All core logic layers must be implemented as **classes** — plain exported functions are not allowed for these layers, no exceptions:
- **Controllers** must be classes. Each HTTP handler is a class method, not a standalone function.
- **Services** must be classes. Business logic lives in instance methods.
- **Repositories** must be classes, implementing their corresponding interface (e.g. `class UserRepository implements IUserRepository`) and extending `BaseRepository<T>`.
- **Helpers/utilities** must also be classes — even a single-purpose helper (e.g. date formatting, string manipulation, token generation) must be wrapped in a class (using `static` methods if no internal state is needed) instead of exported as a bare function.
- Dependencies must be wired through **constructor injection** (e.g. `constructor(private readonly userService: UserService) {}`), not imported and called directly inside a function body. This keeps every class testable via mocking.
- Route files stay thin, but must also be classes: define a shared `BaseRoute` (abstract class) in `common/` with a `path: string`, a `router: Router` instance, and an abstract `initializeRoutes(): void` method. Each module's route class (e.g. `class UserRoute extends BaseRoute`) implements `initializeRoutes()` to instantiate its controller and register endpoints (e.g. `this.router.get('/:id', this.userController.getById.bind(this.userController))`) — never write bare `router.get(...)` calls directly in a plain script/module.
- In `app.ts`, collect every module's route class into a single array (e.g. `const routes: BaseRoute[] = [new UserRoute(), new AuthRoute()]`) and register each one with `app.use(route.path, route.router)`. This keeps adding a new module a matter of instantiating one more route class, with no other wiring file to touch.
- Express requires middleware to be plain functions by signature — where a middleware needs actual logic (e.g. the centralized error handler), implement the logic inside a class with a method, then export a bound reference to that method (e.g. `export const errorHandler = new ErrorHandlerMiddleware().handle.bind(...)`), so the underlying logic still lives inside a class.
- Reject/avoid utility modules that just re-export a bag of loose functions (`export function formatDate() {}`, `export function slugify() {}`). Convert them into a class, e.g. `class DateHelper { static format(...) {} }`, `class StringHelper { static slugify(...) {} }`.

## 2.2 Dependency Injection (Mandatory)
- Use a lightweight DI container — **`tsyringe`** — across all microservices for consistency. Enable `experimentalDecorators` and `emitDecoratorMetadata` in `tsconfig.json`, and import `reflect-metadata` once at the app entry point.
- Mark every injectable class (repository, service, controller, helper) with `@injectable()`.
- Declare dependencies via constructor parameters, injected automatically by the container (e.g. `constructor(@inject(UserRepository) private readonly userRepo: UserRepository) {}`) rather than manually instantiated with `new` inside another class.
- Register interface-to-implementation bindings in a single composition root (e.g. `src/container.ts`), so swapping an implementation (for tests, or for the Mongo → Postgres style migration covered in the DB migration standard) only requires changing one registration line.
- Route classes (from 2.1) resolve their controller from the container instead of constructing it manually: `container.resolve(UserController)`.
- Manual `new` is only acceptable inside the composition root/container registration and for simple value objects/DTOs — never for wiring a service's own dependencies.
- This makes every class trivially testable: resolve the class under test with a mocked dependency registered in a test-scoped container, no manual monkey-patching required.

## 2.3 Application Bootstrap (Mandatory)
The Express app initialization/bootstrap logic must also be class-based and go through the same DI container — no loose `const app = express(); app.use(...)` script at the top level.
- **`App` class** (`app.ts`, `@injectable()`): owns the Express instance. Its constructor/init method is responsible for, in order:
  1. Registering global middlewares (`helmet`, `cors`, body parser, request logger).
  2. Resolving and registering every module's route class (from 2.1/2.2) via the DI container.
  3. Registering the health check route.
  4. Registering the centralized error-handling middleware **last**, after all routes.
  - Expose the underlying `express.Application` instance via a getter (e.g. `get instance()`) for the server class to consume — nothing outside `App` should touch `express()` directly.
- **`Server`/`Bootstrap` class** (`server.ts`, `@injectable()`): the actual composition root/entry point. Responsible for:
  1. Resolving `App` (and anything else needed, e.g. the DB connection class) from the DI container.
  2. Establishing the database connection **before** accepting traffic.
  3. Starting the HTTP listener on the configured port.
  4. Handling graceful shutdown on `SIGTERM`/`SIGINT` (stop accepting new connections, close the DB connection/pool, then exit) — important for clean pod termination during Kubernetes rolling updates/HPA scale-down.
  - This class is instantiated once, at the very bottom of `server.ts`: `container.resolve(Bootstrap).start()`. This is the one place in the codebase where resolving directly from the container at the top level is expected, since it's the composition root itself.
- Neither `App` nor `Server`/`Bootstrap` should contain business logic or direct database queries — they only orchestrate startup order and wiring, consistent with every other layer in this standard.

## 3. Standard Folder Structure
```
src/
  config/            # env loader, app config, constants
  common/
    middlewares/      # error handler, auth, request logger, etc.
    errors/            # custom error classes (AppError, NotFoundError, ValidationError, etc.)
    utils/               # generic helper functions
    response/         # standard response formatter (success/error wrapper)
    types/               # shared/global TypeScript types & interfaces
    base.route.ts        # abstract BaseRoute class (path, router, initializeRoutes contract)
    base.repository.ts   # generic BaseRepository<T> class
  database/
    connection.ts       # single source of DB connection/pool
    migrations/         # migration files
  modules/
    <feature-name>/
      <feature>.route.ts
      <feature>.controller.ts
      <feature>.service.ts
      <feature>.repository.ts
      <feature>.dto.ts        # request/response schema, validation & inferred types
      <feature>.types.ts      # module-specific interfaces/types (entity shape, etc.)
  health/
    health.controller.ts   # exposes /health and /health/db
    health.checker.ts      # periodic DB health check logic
  server.ts              # Bootstrap class (composition root, starts the HTTP listener)
  app.ts                 # App class (Express instance, middleware & route registration)
tsconfig.json
```
- Every new feature/domain gets its own folder under `modules/`, following the same files above (route, controller, service, repository, dto, types).
- Do not put business logic in `route.ts` or `controller.ts`.
- Do not query the database anywhere outside a `*.repository.ts` file.

## 4. Repository Pattern
- Every module must have a repository file that exposes clear, intention-revealing methods (e.g. `findById`, `findAllByStatus`, `createUser`) instead of exposing raw query builders to the service layer.
- Define an **interface** for each repository (e.g. `IUserRepository`) describing its method contracts, so the service layer depends on the interface/type rather than a concrete implementation. This makes it easy to mock in tests and to swap implementations later.
- Create a shared **base repository** (`common/base.repository.ts`), implemented as a generic class (e.g. `BaseRepository<T>`) with common methods (`findById`, `findAll`, `create`, `update`, `delete`) that feature-specific repositories can extend, to avoid duplicated boilerplate.
- The service layer must never import the database client/ORM directly — it only depends on repository methods/interfaces.

## 5. DTO & Validation
- Every incoming request must be validated using a schema validation library (e.g. `zod`) defined in the module's `dto.ts` file. Prefer `zod` since it lets you infer TypeScript types directly from the schema (`z.infer<typeof schema>`), keeping validation and types in sync.
- Validation happens at the route/controller boundary, before the request reaches the service layer.
- Response shapes returned to the client should also follow a consistent DTO/mapper type so internal database fields/entity types are never leaked directly into the API response.

## 6. Error Handling
- Use custom error classes extending a base `AppError` (e.g. `NotFoundError`, `ValidationError`, `UnauthorizedError`) placed in `common/errors/`.
- Use a single centralized error-handling middleware (typed with Express's `ErrorRequestHandler`) registered in `app.ts` — no scattered `try/catch` with inconsistent response shapes across controllers.
- Wrap async route handlers with a reusable, generically-typed `asyncHandler<T>` utility so errors are automatically forwarded to the centralized error handler instead of requiring manual `try/catch` in every controller.

## 7. Standard Response Format
- All API responses (success and error) must follow one consistent JSON shape across every microservice, for example:
  ```json
  { "success": true, "data": {}, "message": "" }
  { "success": false, "error": { "code": "", "message": "" } }
  ```
- Implement this via a shared response formatter in `common/response/` and use it consistently across all controllers.

## 8. Configuration & Environment Variables
- All environment variables must be loaded and validated in a single `config/` module at startup (fail fast if a required variable is missing), instead of reading `process.env` directly throughout the codebase.
- Every microservice must include a `.env.example` file listing all required environment variables.

## 9. Logging
- Use a single, consistent logging library (e.g. `pino` or `winston`) across all microservices, configured once in `common/utils/logger.ts`.
- Use consistent log levels (`info`, `warn`, `error`, `debug`) and structured log format (JSON) so logs are easy to aggregate across services.

## 10. Health Check
- Every microservice must expose:
  - `GET /health` — basic liveness check.
  - `GET /health/db` — database connectivity check.
- The database health checker must run automatically on an interval (see the Kubernetes/Jenkins standard document for the auto-restart and auto-reconnect behavior expected around this).

## 11. TypeScript Configuration
- Every microservice must use a shared/consistent `tsconfig.json` base (either duplicated with the same settings, or extended from an internal shared config package once available).
- `strict: true` must be enabled — no implicit `any`, no disabling strict checks to "make it compile faster."
- Avoid using `any`; prefer `unknown` with proper narrowing, or define a proper interface/type instead.
- `build` compiles TypeScript to JavaScript (e.g. via `tsc`) into a `dist/` folder, which is what actually runs in production/containers — the container should never run `ts-node` directly in production.

## 12. package.json Script Convention
Every microservice's `package.json` must expose the same standard script names so tooling (CI, AI agents, developers) can rely on them consistently:
- `start:local:dev` — run the service locally in development mode (e.g. via `ts-node-dev`/`nodemon` with TypeScript support, with hot-reload).
- `test` — run the test suite.
- `lint` — run the linter (should also cover type-checking, or pair it with a separate `typecheck` script running `tsc --noEmit`).
- `build` — compile TypeScript to JavaScript (`tsc`) for production.

## 13. Package Manager & Dependencies
- All microservices use **pnpm** as the package manager.
- Keep `pnpm-lock.yaml` out of version control (`.gitignore`), consistent with the rest of the services.
- Shared dependencies (validation library, logger, error classes, response formatter) should ideally be extracted into an internal shared package once multiple services stabilize on the same pattern, to avoid copy-pasting boilerplate.

## 14. Linting & Formatting
- Use a shared ESLint (with `@typescript-eslint`) + Prettier configuration across all microservices so code style stays identical regardless of who writes it.
- Linting must be run as part of the CI pipeline (see the Jenkinsfile standard) and should fail the build on violations, including type-check failures.

## 15. Testing Convention
- Unit tests: test the service and repository layers in isolation (repository can be mocked via its interface when testing the service layer).
- Integration tests: test the full route -> controller -> service -> repository -> database flow against a test database.
- Test files live next to the code they test (`*.spec.ts`/`*.test.ts`) or under a mirrored `__tests__/` structure — pick one convention and apply it to every module.

## 16. Memory & Performance Efficiency Under High Traffic
- **Never buffer unbounded data in memory.** Always paginate list endpoints (limit/offset or cursor-based) — never return an entire table/collection in one response. Enforce a max `limit` at the DTO validation layer.
- **Stream large payloads** (file downloads, large exports) using Node streams/`pipe()` instead of loading the full file/response into memory before sending.
- **Use the Node.js `cluster` module or a process manager (e.g. PM2 in cluster mode)** inside the container so the service can use multiple CPU cores, since Node.js itself is single-threaded per process — this multiplies throughput without needing extra pods.
- **Cache expensive/repeated reads** (e.g. via Redis) instead of hitting the database repeatedly for the same data on every request. Set a sensible TTL and invalidate on writes; cached data must never bypass the repository layer's typing/contract.
- **Bound in-memory caches and collections.** Any in-process cache (e.g. a `Map` used as a simple memoization store) must have a max size/eviction policy (LRU) — an unbounded cache is a memory leak waiting to happen under sustained traffic.
- **Watch for event listener/timer leaks**: always clear `setInterval`/`setTimeout` and remove event listeners when a resource (e.g. a request-scoped object) is done, especially relevant for the DB health check interval from the Kubernetes/Jenkins standard — make sure it's a single long-lived interval, not one created per request.
- **Tune database connection pool size** to match expected concurrency instead of leaving default values — an oversized pool wastes memory per connection, an undersized one causes request queuing under load.
- **Set explicit Node.js heap limits** (`--max-old-space-size`) consistent with the container's Kubernetes memory `limits`, so the process fails fast/predictably instead of the container being OOMKilled at an arbitrary point.
- **Avoid heavy synchronous/CPU-bound work on the main event loop** (e.g. large JSON parsing, image processing, complex regex on large strings) — offload it to a worker thread or a separate queue/worker service so it doesn't block request handling for other users during high traffic.
- **Prefer lightweight, tree-shakeable dependencies** and import only what's needed (e.g. `import { pick } from 'lodash-es'` instead of importing the entire `lodash` package) to keep both bundle size and runtime memory footprint smaller.
- **Add a circuit breaker/timeout** on outbound calls to other services or the database so a slow downstream dependency doesn't pile up pending requests (and their associated memory) under high traffic.
- These practices complement — not replace — the HPA-based auto-scaling already defined in the Kubernetes standard: scaling out handles overall load, while these practices prevent any single pod from leaking or wasting memory under sustained traffic.

## 17. Important Rule

> **Do not ask for permission to commit and push first.**
> The AI agent is **prohibited** from committing and pushing to the repository before receiving an explicit instruction from the user.
> All changes should remain saved locally (working directory) until further instructions are given.

## 18. Summary
1. Follow the Route -> Controller -> Service -> Repository -> Database layered architecture for every module.
2. Use the standard folder structure under `src/modules/<feature-name>/`, with `.ts` files throughout.
3. Implement every core logic layer — controller, service, repository, route, helper, and the app bootstrap (`App`/`Bootstrap` classes) — as a class; wire dependencies through `tsyringe`-based dependency injection, not manual `new` or bare functions.
4. Apply the repository pattern with interfaces and a shared generic base repository.
5. Validate every request with a `zod`-based DTO before it reaches the service layer, and reuse inferred types.
6. Handle errors centrally with custom error classes and a shared response formatter.
7. Load and validate config/env variables in one place; keep a `.env.example` up to date.
8. Use one consistent logging setup and expose `/health` and `/health/db`.
9. Enforce `strict: true` in `tsconfig.json` and avoid `any`.
10. Keep `package.json` script names identical across services (`start:local:dev`, `test`, `lint`, `build`).
11. Use pnpm, shared ESLint/Prettier config, and a consistent testing convention.
12. Apply memory/performance practices (pagination, streaming, clustering, caching, bounded caches, connection pool tuning, circuit breakers) so each pod stays efficient under high traffic.
13. Wait for an explicit instruction from the user before committing and pushing.