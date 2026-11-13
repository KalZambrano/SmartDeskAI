package pe.edu.utp.smartdesk.health;

import java.time.Clock;
import java.time.Instant;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/health")
class HealthController {

    private static final String STATUS_UP = "UP";

    private final Clock clock;
    private final String applicationName;

    HealthController(Clock clock, @Value("${spring.application.name}") String applicationName) {
        this.clock = clock;
        this.applicationName = applicationName;
    }

    @GetMapping
    HealthResponse health() {
        return new HealthResponse(STATUS_UP, applicationName, Instant.now(clock));
    }
}
