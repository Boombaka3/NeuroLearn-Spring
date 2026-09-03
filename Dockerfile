FROM node:22-alpine AS frontend-build
WORKDIR /workspace/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
ARG VITE_API_BASE_URL=
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN npm run build

FROM eclipse-temurin:17-jdk-alpine AS backend-build
WORKDIR /workspace/backend
COPY backend/pom.xml backend/mvnw ./
COPY backend/.mvn .mvn
RUN ./mvnw --batch-mode dependency:go-offline
COPY backend/src src
COPY --from=frontend-build /workspace/frontend/dist src/main/resources/static
RUN ./mvnw --batch-mode package -DskipTests

FROM eclipse-temurin:17-jre-alpine
RUN addgroup -S neurolearn && adduser -S neurolearn -G neurolearn
WORKDIR /app
COPY --from=backend-build --chown=neurolearn:neurolearn /workspace/backend/target/neurolearn-0.0.1-SNAPSHOT.jar neurolearn.jar
COPY --chown=neurolearn:neurolearn backend/docker-entrypoint.sh docker-entrypoint.sh
RUN chmod 755 docker-entrypoint.sh
USER neurolearn
EXPOSE 8080
ENTRYPOINT ["/app/docker-entrypoint.sh"]
