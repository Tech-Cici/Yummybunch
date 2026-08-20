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

# Tuned for a 512 MB container. MaxRAMPercentage=75 asked for a 384 MB heap,
# which — once metaspace, thread stacks and native memory are added — exceeded
# the limit and got the JVM SIGKILLed mid-request with no log output.
#   SerialGC        : G1's bookkeeping is wasted on a single small heap
#   TieredStopAtLevel=1 : far quicker warm-up on a CPU-starved instance
#   Xss512k         : 200 Tomcat threads at 1 MB of stack each is not affordable
ENV SPRING_PROFILES_ACTIVE=prod \
    UPLOAD_DIR=/data/uploads \
    JAVA_OPTS="-XX:MaxRAMPercentage=50 -XX:MaxMetaspaceSize=128m -XX:+UseSerialGC -XX:TieredStopAtLevel=1 -Xss512k"

# Hosts inject $PORT; Spring reads it via server.port in the prod profile.
ENTRYPOINT ["sh","-c","java $JAVA_OPTS -jar app.jar"]
