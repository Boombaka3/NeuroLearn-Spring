# NeuroLearn

NeuroLearn is an interactive AI learning platform. Its first course is **Brain × AI 101**.

This repository is being built as a full-stack application with a React/TypeScript frontend and a Java/Spring Boot REST API backed by PostgreSQL. The backend currently includes the foundation and the assessment workflow.

## Current foundation

- Java 17 and Spring Boot 3
- Maven Wrapper
- Spring Web, Spring Data JPA, and Jakarta Validation
- PostgreSQL with Flyway migrations
- `GET /api/health`
- JUnit 5 and MockMvc tests
- Docker Compose configuration for local PostgreSQL
- Anonymous pre-course and post-course assessment persistence
- Stable validation and conflict error responses

## Assessment API

Participant codes are non-personal identifiers containing 6–32 letters, numbers, or single hyphens. A participant may submit one PRE and one POST assessment. A PRE submission creates the participant; POST and lookup require that participant to exist.

```http
POST /api/assessments/pre
POST /api/assessments/post
GET  /api/assessments/participants/{participantCode}
```

Submission body:

```json
{
  "participantCode": "LEARNER-001",
  "answers": {
    "aiFamiliarity": 3,
    "neuronUnderstanding": 2,
    "aiUnderstanding": 3
  }
}
```

Each answer is required and must be an integer from 1 through 5.

## Run locally

Requirements: Java 17 and Docker Desktop (or another PostgreSQL 16 instance).

```powershell
Copy-Item .env.example .env
docker compose up -d postgres
$env:POSTGRES_DB = "neurolearn"
$env:POSTGRES_USER = "neurolearn"
$env:POSTGRES_PASSWORD = "change-me-for-local-development"
cd backend
.\mvnw.cmd spring-boot:run
```

Check the service at `http://localhost:8080/api/health`.

## Test and package

```powershell
cd backend
.\mvnw.cmd test
.\mvnw.cmd package
```

Tests use an isolated in-memory database; production and local runtime configuration target PostgreSQL.

## Planned architecture

```text
React / TypeScript
        ↓
Spring Boot REST DTOs
        ↓
Controller → Service → Repository
        ↓
PostgreSQL
```

The software platform is named **NeuroLearn**. Student-facing curriculum retains the course name **Brain × AI 101**.
