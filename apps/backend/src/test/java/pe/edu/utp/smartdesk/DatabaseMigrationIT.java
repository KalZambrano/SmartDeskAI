package pe.edu.utp.smartdesk;

import static org.assertj.core.api.Assertions.assertThat;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;

import jakarta.persistence.EntityManager;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Import(PostgresTestConfiguration.class)
class DatabaseMigrationIT {

    private static final long INITIAL_CATEGORIES = 6L;

    @Autowired
    private EntityManager entityManager;

    @Value("${local.server.port}")
    private int port;

    @Test
    void appliesMigrationsAndSeedsInitialCategories() {
        Long total = entityManager
                .createQuery("select count(c) from Category c", Long.class)
                .getSingleResult();

        assertThat(total).isEqualTo(INITIAL_CATEGORIES);
    }

    @Test
    void exposesHealthEndpointWithoutAuthentication() throws Exception {
        HttpResponse<String> response = get("/api/v1/health");

        assertThat(response.statusCode()).isEqualTo(200);
        assertThat(response.body()).contains("\"status\":\"UP\"");
    }

    @Test
    void rejectsUnauthenticatedAccessToProtectedEndpoints() throws Exception {
        HttpResponse<String> response = get("/api/v1/tickets");

        assertThat(response.statusCode()).isEqualTo(401);
    }

    private HttpResponse<String> get(String path) throws Exception {
        HttpRequest request = HttpRequest.newBuilder(URI.create("http://localhost:" + port + path)).GET().build();
        try (HttpClient client = HttpClient.newHttpClient()) {
            return client.send(request, HttpResponse.BodyHandlers.ofString());
        }
    }
}
