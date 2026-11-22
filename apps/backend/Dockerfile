FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /workspace
COPY pom.xml .
RUN mvn --batch-mode dependency:go-offline
COPY src ./src
RUN mvn --batch-mode -DskipTests package

FROM tomcat:11-jdk21
ENV CATALINA_OPTS="-XX:MaxRAMPercentage=75"
COPY --from=build /workspace/target/smartdesk-backend.war /usr/local/tomcat/webapps/ROOT.war
EXPOSE 8080
