# Use a multi-stage build to keep the image small
FROM maven:3.9.9-eclipse-temurin-21-alpine AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
# Skip tests to speed up the build
RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# IMPORTANT: Set memory limits for Render's 512MB Free Tier
# -Xmx350m leaves ~162MB for Metaspace, threads, and OS overhead
ENV JAVA_TOOL_OPTIONS="-Xmx350m -Xss512k -XX:CICompilerCount=2 -Dfile.encoding=UTF-8 -XX:+UseContainerSupport"

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
