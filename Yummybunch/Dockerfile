# ---------------------------------------------------------------------------
# Build stage: compile and package the jar.
# Dependencies are resolved in their own layer so code changes do not force a
# full re-download on every build.
# ---------------------------------------------------------------------------
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /build

COPY pom.xml .
RUN mvn -B -q dependency:go-offline

COPY src ./src
RUN mvn -B -q clean package -DskipTests

# ---------------------------------------------------------------------------
# Run stage: JRE only, no build tools in the shipped image.
# ---------------------------------------------------------------------------
FROM eclipse-temurin:17-jre AS runtime
WORKDIR /app

# Do not run as root.
RUN useradd -r -u 1001 -m appuser

# Uploads live here. Mount a persistent volume at this path, or every
# restaurant photo is lost the moment the container is replaced.
RUN mkdir -p /data/uploads && chown -R appuser:appuser /data

COPY --from=build /build/target/*.jar app.jar
RUN chown appuser:appuser app.jar

USER appuser
EXPOSE 8080

ENV SPRING_PROFILES_ACTIVE=prod \
    UPLOAD_DIR=/data/uploads \
    JAVA_OPTS="-XX:MaxRAMPercentage=75"

# Hosts inject $PORT; Spring reads it via server.port in the prod profile.
ENTRYPOINT ["sh","-c","java $JAVA_OPTS -jar app.jar"]
