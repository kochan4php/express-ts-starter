# Instructions for AI Agent — Kubernetes, Jenkins CI/CD & Database Resilience

## 1. Purpose
This document contains the working instructions that the AI agent must follow to implement Kubernetes deployment, a Jenkins pipeline (Jenkinsfile), pod auto-scaling, pod auto-restart on hang, database auto-reconnect, and a database health check controller for this service. Follow every step in order and do not skip any stage.

## 2. Workflow

### 2.1 Understand the Service Context
- Read through the entire project structure (folders, configuration files, README if available).
- Identify how the service currently starts, its entry point, exposed port, environment variables, and how it connects to the database.
- Check whether a `Dockerfile`, Kubernetes manifests, or `Jenkinsfile` already exist. If they exist, use them as the base and update as needed instead of creating everything from scratch.
- Check `package.json` for available scripts and dependencies.

### 2.2 Kubernetes Manifests
- Create/update the following manifests (as separate YAML files, e.g. under a `k8s/` directory, or as a Helm chart if the project already uses Helm):
  - **Deployment**: container image, resource requests/limits, environment variables, and a rolling update strategy.
  - **Service**: expose the pod internally (ClusterIP) or as needed.
  - **ConfigMap/Secret**: for configuration and sensitive credentials (including database connection details), not hardcoded in the Deployment.
- Set **liveness probe** and **readiness probe** on the Deployment:
  - Liveness probe: hits a health endpoint (e.g. `/health` or `/healthz`) so Kubernetes automatically restarts the pod when the service hangs/stops responding.
  - Readiness probe: makes sure the pod only receives traffic once it's genuinely ready (including once the database connection is established).
- Set appropriate `initialDelaySeconds`, `periodSeconds`, `timeoutSeconds`, and `failureThreshold` values so pods aren't restarted prematurely.

### 2.3 Auto Scaling (HPA)
- Create a **HorizontalPodAutoscaler (HPA)** resource for the Deployment.
- Set the scaling metric (CPU and/or memory utilization) along with `minReplicas` and `maxReplicas` according to reasonable defaults, unless the project already has specific capacity guidance.
- Make sure `resources.requests` is set correctly on the Deployment, since HPA relies on this value to calculate utilization.

### 2.4 Jenkinsfile
- Create/update a `Jenkinsfile` (declarative pipeline) with stages that at minimum include:
  1. **Checkout** — pull the source code.
  2. **Install Dependencies** — run `pnpm install`.
  3. **Test** — run the test scripts available in `package.json`.
  4. **Build** — build the Docker image.
  5. **Push** — push the image to the container registry used by the project.
  6. **Deploy** — apply the Kubernetes manifests (e.g. via `kubectl apply` or Helm) to the target cluster.
- Use credentials/secrets from the Jenkins credential store for the registry and cluster access — do not hardcode any credentials in the Jenkinsfile.

### 2.5 Database Auto-Reconnect
- Implement retry/reconnect logic on the database connection layer so that when the connection drops, the service automatically attempts to reconnect (e.g. exponential backoff) instead of crashing or requiring a manual restart.
- Log every disconnect and reconnect attempt so it's easy to trace from the container logs.
- Make sure the reconnect mechanism doesn't block the main event loop/thread of the service.

### 2.6 Database Health Check Controller
- Create a controller/module that checks the database connection status **automatically every 10 seconds** while the container is running (e.g. via `setInterval`/a scheduler/cron, adjusted to the language/framework used).
- The health check result should be exposed through a health endpoint (e.g. `/health` or `/health/db`) so it can be used by the Kubernetes liveness/readiness probe from step 2.2.
- If the health check fails N times in a row (define a reasonable threshold), make sure the reconnect logic from step 2.5 is triggered and/or the health endpoint returns a failing status so Kubernetes can restart the pod as needed.
- Log every health check result (success/failure) along with a timestamp.

### 2.7 Run Testing
- Run tests using the scripts available in `package.json`.
- **Mandatory**: explicitly run the following script: `start:local:dev`
- Make sure the service runs without errors, the health check controller runs on the 10-second interval as expected, and the liveness/readiness endpoints respond correctly.
- Record and fix any errors or warnings that appear during testing.

### 2.8 Test Database Connectivity
- Run a `curl` request against one of the API endpoints that is directly related to the database.
- Make sure the response received is valid (status code as expected, returned data in the expected format).
- Simulate a database disconnect if possible (e.g. by stopping the local database container) to confirm the auto-reconnect and health check controller behave as expected, then restore the connection and re-verify.

## 3. Important Rule

> **Do not ask for permission to commit and push first.**
> The AI agent is **prohibited** from committing and pushing to the repository before receiving an explicit instruction from the user.
> All changes should remain saved locally (working directory) until further instructions are given.

## 4. Workflow Summary

1. Understand the service context: entry point, port, env vars, and database connection.
2. Create/update Kubernetes manifests (Deployment, Service, ConfigMap/Secret) with liveness & readiness probes.
3. Add a HorizontalPodAutoscaler for pod auto-scaling.
4. Create/update the Jenkinsfile covering checkout, install, test, build, push, and deploy stages.
5. Implement database auto-reconnect logic with retry/backoff.
6. Build a database health check controller that runs automatically every 10 seconds and exposes its status via a health endpoint.
7. Run testing via `package.json` scripts, specifically `start:local:dev`.
8. Curl one API endpoint related to the database, and simulate a disconnect to verify reconnect and health check behavior.
9. Wait for an explicit instruction from the user before committing and pushing.