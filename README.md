# NeuroLearn

NeuroLearn is an interactive AI learning platform. Its first course is **Brain × AI 101**.

This repository is being built as a full-stack application with a planned React/TypeScript frontend and a Java/Spring Boot REST API backed by PostgreSQL. The repository currently contains the backend foundation, assessment workflow, server-scored quiz, completion verification, certificate generation, and administrative CSV export.

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
- Server-controlled quiz scoring with normalized answer persistence
- Server-verified completion and downloadable PDF certificates
- Minimal completion CSV export for portfolio administration

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

## Quiz API

The quiz accepts exactly one answer for each question ID `q1` through `q5`. Options are `A` through `D`; the trusted answer key and score calculation remain on the backend. A participant must already exist and may submit the quiz once.

```http
POST /api/quiz/submissions
```

```json
{
  "participantCode": "LEARNER-001",
  "answers": {
    "q1": "A",
    "q2": "D",
    "q3": "B",
    "q4": "C",
    "q5": "A"
  }
}
```

The response contains the server-calculated `score`, `total`, and `percentage`; client-supplied score fields are rejected.

## Completion and certificates

A participant is complete only after the server finds all three persisted records: one PRE assessment, one quiz submission, and one POST assessment. No attendance or score threshold is invented.

```http
GET  /api/completion/{participantCode}
POST /api/certificates
```

Certificate request:

```json
{
  "participantCode": "LEARNER-001",
  "displayName": "Ada Lovelace"
}
```

The display name is validated, drawn into the PDF only for that response, and is not stored. Certificate generation returns `409 COURSE_NOT_COMPLETED` until all three requirements exist.

## Administrative CSV export

```http
GET /api/admin/export.csv
```

The CSV contains participant code, PRE timestamp, server-stored quiz score, POST timestamp, and derived completion state. It intentionally excludes names and answer details.

**Security limitation:** this endpoint has no authentication or authorization and is development/portfolio functionality only. Do not expose it publicly until access control is added.

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
React / TypeScript (planned; no frontend is currently committed)
        ↓
Spring Boot REST DTOs
        ↓
Controller → Service → Repository
        ↓
PostgreSQL
```

The software platform is named **NeuroLearn**. Student-facing curriculum retains the course name **Brain × AI 101**.
