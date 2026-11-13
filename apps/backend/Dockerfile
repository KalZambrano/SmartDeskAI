FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /workspace
COPY pom.xml .
RUN mvn --batch-mode dependency:go-offline
COPY src ./src
RUN mvn --batch-mode -DskipTests package

FROM eclipse-temurin:21-jre-alpine
RUN addgroup -S smartdesk && adduser -S smartdesk -G smartdesk
WORKDIR /app
COPY --from=build /workspace/target/smartdesk-backend.jar app.jar
USER smartdesk
EXPOSE 8080
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-jar", "app.jar"]
