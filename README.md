# NeuroLearn

NeuroLearn is a full-stack portfolio learning application. Its first student-facing course, **Brain × AI 101**, combines interactive lessons and labs with a Spring Boot backend that records anonymous evaluations, scores a fixed quiz, evaluates completion, generates certificates, and exports a minimal administrative CSV.

The product name is **NeuroLearn**. **Brain × AI 101** is the course name.

## Architecture

```text
React / TypeScript
        ↓ HTTP/JSON
Spring Boot REST API
        ↓
Service Layer
        ↓
Spring Data JPA
        ↓
PostgreSQL
```

The canonical course client uses Redux Toolkit for navigation and language state and browser storage for non-sensitive course progress. The Spring service remains authoritative for quiz scores, persisted submissions, completion, and certificate eligibility. Controllers handle HTTP concerns, services own business rules and transactions, repositories own persistence, and DTOs keep JPA entities out of the API.

## Implemented features

- English and Chinese Brain × AI 101 course interface
- Three interactive course modules covering neurons, neural networks, and training
- Animated diagrams, 3D assets, clustering/convolution labs, and embedded educational simulations
- Anonymous participant codes; student names are not stored
- Validated PRE and POST evaluations with six fixed ratings and optional reflections
- Ten-question quiz scored only by the backend
- Normalized answer and calculated-score persistence
- Completion derived from a non-skipped PRE evaluation, quiz, and POST evaluation
- On-demand PDF certificates for completed participants
- API-key-protected administrative CSV export
- Stable JSON validation and domain errors
- Forward-only Flyway migrations with Hibernate schema validation
- Environment-configured API URL and exact-origin CORS
- Automated Java and frontend verification in GitHub Actions

## Technology stack

- Java 17, Spring Boot 3.5, Spring Web
- Jakarta Bean Validation, Spring Data JPA, Hibernate
- PostgreSQL 16, Flyway
- Apache PDFBox 3
- Maven Wrapper, JUnit 5, AssertJ, Mockito, MockMvc
- H2 in PostgreSQL compatibility mode for automated integration tests
- React 19, TypeScript 5.9, Vite 7
- Redux Toolkit, React Three Fiber, Three.js, Framer Motion, GSAP
- Vitest and Testing Library

## Repository structure

```text
.
├── backend/
│   ├── src/main/java/.../
│   │   ├── assessment/       participant and PRE/POST workflow
│   │   ├── quiz/             trusted scoring and persistence
│   │   ├── completion/       derived completion status
│   │   ├── certificate/      PDF certificate generation
│   │   ├── admin/            protected CSV export
│   │   ├── common/error/     centralized API errors
│   │   ├── config/           CORS and application configuration
│   │   └── health/           health endpoint
│   ├── src/main/resources/db/migration/
│   └── src/test/
├── frontend/
│   ├── public/               models, simulations, runtime assets
│   ├── src/modules/          course modules and evaluations
│   ├── src/components/       shared UI and visual components
│   ├── src/lib/api/          Spring REST adapters
│   ├── src/store/            Redux state
│   └── src/i18n/             English and Chinese copy
├── compose.yaml              local PostgreSQL
├── Dockerfile                optional same-origin application image
├── render.yaml               optional Render full-stack blueprint
└── .github/workflows/ci.yml  backend and frontend CI
```

## Local setup

Requirements: Java 17, Node.js 22 or newer, and PostgreSQL 16 (directly or through Docker).

```powershell
Copy-Item .env.example .env
docker compose up -d postgres
docker compose ps
```

The example password is local-only. Replace it before using a shared environment. The application and Compose configuration fail fast when `POSTGRES_PASSWORD` is absent.

### Backend

Spring Boot does not automatically load the root `.env`, so expose its values to the process:

```powershell
$env:POSTGRES_DB = "neurolearn"
$env:POSTGRES_USER = "neurolearn"
$env:POSTGRES_PASSWORD = "change-me-for-local-development"
Set-Location backend
.\mvnw.cmd spring-boot:run
```

Health check: `http://localhost:8080/api/health`.

```powershell
.\mvnw.cmd test
.\mvnw.cmd package
```

### Frontend

```powershell
Set-Location frontend
npm install
npm run dev
npm test -- --run
npm run build
```

Development uses `http://localhost:8080` unless `VITE_API_BASE_URL` is set. Production builds use the configured URL; when it is omitted, requests are relative to the frontend origin.

## API summary

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Application health |
| `POST` | `/api/assessments/pre` | Create a participant and persist the PRE evaluation |
| `POST` | `/api/assessments/post` | Persist the POST evaluation |
| `GET` | `/api/assessments/participants/{participantCode}` | Retrieve PRE/POST submissions as DTOs |
| `POST` | `/api/quiz/submissions` | Validate ten answers, calculate the trusted score, and persist it |
| `GET` | `/api/completion/{participantCode}` | Return prerequisite status and derived completion |
| `POST` | `/api/certificates` | Return a PDF for a completed participant |
| `GET` | `/api/admin/export.csv` | Download the `X-Admin-Key`-protected CSV export |

Participant codes contain 6–32 letters or numbers separated by single hyphens. Evaluation ratings are integers from 1 through 5. Quiz submissions require exactly `q1` through `q10`, with options `A` through `D`. Unknown JSON properties are rejected. The quiz request cannot supply a score or answer key.

Certificate requests contain a participant code and a conservatively validated display name. The name is used only to draw that response and is not persisted. Generation returns `409 COURSE_NOT_COMPLETED` unless the stored completion rule passes.

## Database migrations

Flyway is the schema source of truth and Hibernate uses `ddl-auto: validate`.

| Migration | Purpose |
| --- | --- |
| `V1__initialize_neurolearn.sql` | Baseline |
| `V2__create_assessment_tables.sql` | Participants and assessment submissions |
| `V3__create_quiz_tables.sql` | Quiz submissions, normalized answers, constraints, and indexes |
| `V4__add_canonical_assessment_details.sql` | Six canonical ratings, reflections, and skipped-PRE state |

## Tests

The backend suite covers DTO validation, domain services, deterministic scoring, JPA persistence, migrations, MockMvc workflows, completion, PDF generation, CSV behavior, CORS, and admin access. The frontend tests cover Spring adapters and selected course interactions. GitHub Actions runs tests and builds on `main` pushes and pull requests.

Automated persistence tests use isolated H2 in PostgreSQL compatibility mode and execute all Flyway migrations. They do not accidentally connect to production, but a real PostgreSQL/Testcontainers suite is not yet present.

## Configuration and security boundaries

- Runtime database: `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_DB`, `POSTGRES_USER`, required `POSTGRES_PASSWORD`.
- Production profile: `SPRING_DATASOURCE_URL`, `DB_USERNAME`, `DB_PASSWORD`, `FRONTEND_ORIGIN`, and `ADMIN_API_KEY`.
- Frontend build: `VITE_API_BASE_URL`.
- The admin route requires `X-Admin-Key` and fails closed when no key is configured.
- CORS accepts the exact configured `FRONTEND_ORIGIN`; it does not use a wildcard.
- No user identity system, role model, rate limiting, or cryptographically signed certificate exists.

## Deployment

The current Vercel target is the frontend only:

| Vercel setting | Value |
| --- | --- |
| Repository | `Boombaka3/NeuroLearn-Spring` |
| Production branch | `main` |
| Root Directory | `frontend` |
| Framework Preset | Vite |
| Install Command | `npm install` (or auto-detected) |
| Build Command | `npm run build` |
| Output Directory | `dist` |

The public frontend target is `https://neurolearn-spring.vercel.app`. A live frontend alone is not a full-stack deployment. The Spring Boot service and PostgreSQL must be hosted separately, then the Vercel Production environment must set `VITE_API_BASE_URL` to the real HTTPS backend origin and the backend must set `FRONTEND_ORIGIN=https://neurolearn-spring.vercel.app`.

The root Dockerfile and Render Blueprint remain an alternative same-origin deployment path. Do not point this frontend at an unrelated or invented backend URL.

## Known limitations

- The Vercel frontend and Spring/PostgreSQL backend are separate deployment concerns; API workflows cannot work publicly until the real backend URL is configured.
- Administrative API-key protection is intentionally narrow, not a complete authentication or authorization system.
- Automated persistence tests use H2 compatibility mode rather than real PostgreSQL.
- Large educational/3D assets increase initial transfer and the production build reports a chunk-size warning.
- Certificate PDFs are generated on demand but are not cryptographically signed.
- The CSV export is an in-memory, unpaginated utility intended for a small portfolio dataset.
- Production observability and rate limiting are not implemented.

This repository should not be described as production-grade, enterprise, event-driven, a microservice system, RAG, or AI-powered.
