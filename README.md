# NeuroLearn

NeuroLearn is a portfolio learning application whose first student-facing course is **Brain × AI 101**. The implemented repository is currently a Java/Spring Boot backend: it records anonymous pre-course and post-course assessments, scores a fixed quiz on the server, evaluates completion, generates completion certificates, and exports minimal administrative CSV data.

The product name is **NeuroLearn**. **Brain × AI 101** is the course name.

## Architecture

The intended full-stack boundary is:

```text
React / TypeScript (not yet implemented in this repository)
        ↓ HTTP/JSON
Spring Boot REST API
        ↓
Service Layer
        ↓
Spring Data JPA
        ↓
PostgreSQL
```

The current implementation begins at the Spring Boot REST API. Controllers handle HTTP concerns, services own business rules and transactions, repositories own persistence, and API DTOs keep JPA entities out of responses.

## Implemented features

- Health endpoint
- Anonymous participant codes; student names are not stored
- Validated PRE and POST assessment submissions
- Backend-owned quiz answer key and deterministic scoring
- Normalized quiz-answer and score persistence
- Completion derived from PRE assessment, quiz, and POST assessment records
- On-demand PDF certificates for completed participants
- Minimal administrative completion export in CSV format
- Centralized, stable JSON validation and domain-error responses
- Forward-only Flyway migrations with Hibernate schema validation

## Implemented technology stack

- Java 17
- Spring Boot 3.5
- Spring Web
- Jakarta Bean Validation
- Spring Data JPA and Hibernate
- PostgreSQL 16 for local/runtime persistence
- Flyway
- Apache PDFBox 3
- Maven Wrapper
- JUnit 5, AssertJ, Mockito, MockMvc, and H2 in PostgreSQL compatibility mode for tests
- Docker Compose for the local PostgreSQL service

React and TypeScript are not listed here because no frontend is currently committed.

## Repository structure

```text
.
├── backend/
│   ├── .mvn/                         Maven Wrapper support
│   ├── src/main/java/.../
│   │   ├── assessment/               PRE/POST workflow and participant model
│   │   ├── quiz/                     Server-side scoring and quiz persistence
│   │   ├── completion/               Derived course-completion status
│   │   ├── certificate/              PDF certificate generation
│   │   ├── admin/                    CSV export
│   │   ├── common/error/             Stable centralized API errors
│   │   ├── config/                   Application clock configuration
│   │   └── health/                   Health endpoint
│   ├── src/main/resources/
│   │   └── db/migration/             Versioned Flyway SQL
│   └── src/test/                     Unit, persistence, and MockMvc tests
├── compose.yaml                      Local PostgreSQL service
├── .env.example                      Non-secret local configuration example
└── README.md
```

## Local setup

Requirements:

- Java 17
- Docker Desktop, Rancher Desktop, or another PostgreSQL 16 instance

Create local environment configuration:

```powershell
Copy-Item .env.example .env
```

The example password is for local development only. Replace it before using any shared environment. The application and Compose configuration fail fast when `POSTGRES_PASSWORD` is absent.

## Start the database

```powershell
docker compose up -d postgres
docker compose ps
```

Docker Compose reads the root `.env` file automatically.

## Backend commands

Spring Boot does not automatically load the root `.env` file, so expose the same settings to the backend process:

```powershell
$env:POSTGRES_DB = "neurolearn"
$env:POSTGRES_USER = "neurolearn"
$env:POSTGRES_PASSWORD = "change-me-for-local-development"
Set-Location backend
.\mvnw.cmd spring-boot:run
```

Verify the application at `http://localhost:8080/api/health`.

Build and test:

```powershell
Set-Location backend
.\mvnw.cmd test
.\mvnw.cmd package
```

## Frontend commands

No frontend directory or `package.json` is currently committed, so there is no frontend install, test, or build command yet. Browser integration must not be claimed until a real React/TypeScript client and its contract tests exist.

## API summary

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Application health response |
| `POST` | `/api/assessments/pre` | Create a participant and submit the PRE assessment |
| `POST` | `/api/assessments/post` | Submit the POST assessment for an existing participant |
| `GET` | `/api/assessments/participants/{participantCode}` | Retrieve PRE/POST submissions as DTOs |
| `POST` | `/api/quiz/submissions` | Validate answers, calculate the trusted score, and persist the submission |
| `GET` | `/api/completion/{participantCode}` | Return stored prerequisite status and derived completion |
| `POST` | `/api/certificates` | Return a PDF certificate for a completed participant |
| `GET` | `/api/admin/export.csv` | Download the unauthenticated portfolio/admin completion export |

Participant codes contain 6–32 letters or numbers separated by single hyphens. Assessment values are required integers from 1 through 5. Quiz submissions require exactly `q1` through `q5`, with options `A` through `D`. Unknown JSON properties are rejected.

The browser cannot submit a trusted score: the quiz request contains only participant code and answers, while the backend answer key calculates the persisted and returned result.

Certificate requests contain a participant code and a display name. The name is validated, drawn into that response, and never stored. Generation returns `409 COURSE_NOT_COMPLETED` unless PRE, quiz, and POST records all exist.

## Database and migrations

Flyway is the schema source of truth. Hibernate runs with `ddl-auto: validate`; it does not create or update runtime tables.

| Migration | Purpose |
| --- | --- |
| `V1__initialize_neurolearn.sql` | Establish migration history |
| `V2__create_assessment_tables.sql` | Participants and constrained assessment submissions |
| `V3__create_quiz_tables.sql` | Quiz submissions, answers, score constraints, and indexes |

Completion and certificates add no stored state, so they require no additional migration.

## Tests

The suite contains focused DTO-validation and service tests plus persistence and MockMvc integration tests. It covers:

- Valid and invalid assessment submissions
- Malformed JSON, unknown participants, and duplicate submissions
- Perfect, partial, and zero quiz scores
- Missing/unexpected quiz questions and invalid options
- Rejection of client-supplied scores
- JPA persistence and database uniqueness constraints
- Incomplete and complete participant status
- Certificate eligibility, PDF structure/text, safe filenames, and name-length boundaries
- CSV headers, stored rows, escaping, and empty datasets
- The PRE → quiz → POST → completion → certificate → export workflow

Tests use isolated H2 with PostgreSQL compatibility mode and execute the real Flyway migrations. They do not connect to the configured production database. A real PostgreSQL/Testcontainers integration suite is not yet present.

## Configuration and CORS

Runtime database values are supplied through `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_DB`, `POSTGRES_USER`, and required `POSTGRES_PASSWORD` environment variables. No credential is committed.

No CORS policy is configured because there is no browser client in this repository. A future separately hosted frontend will need an explicit allowlist; a wildcard policy should not be assumed.

## Known limitations

- `/api/admin/export.csv` has no authentication or authorization and must not be exposed publicly.
- No frontend is implemented; React/TypeScript integration, loading states, and browser error handling are unverified.
- Automated integration tests use H2 compatibility mode rather than a real PostgreSQL container.
- Docker Compose provisions PostgreSQL only; the backend has no Docker image.
- Certificate PDFs are generated on demand but are not cryptographically signed or independently verifiable.
- Certificate display names use a conservative Latin-character validation policy.
- The CSV export is an in-memory, unpaginated portfolio utility intended for a small dataset.
- No CI workflow, deployment configuration, API authentication, rate limiting, or production observability is currently included.

This repository demonstrates a tested Spring backend; it should not be described as production-grade, enterprise, event-driven, a microservice system, RAG, or AI-powered.
