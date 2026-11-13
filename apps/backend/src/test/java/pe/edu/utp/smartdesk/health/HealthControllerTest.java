package pe.edu.utp.smartdesk.health;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;

import org.junit.jupiter.api.Test;

class HealthControllerTest {

    @Test
    void reportsUpWithApplicationNameAndCurrentInstant() {
        Instant now = Instant.parse("2026-11-12T10:00:00Z");
        HealthController controller = new HealthController(Clock.fixed(now, ZoneOffset.UTC), "smartdesk-ai");

        HealthResponse response = controller.health();

        assertThat(response.status()).isEqualTo("UP");
        assertThat(response.application()).isEqualTo("smartdesk-ai");
        assertThat(response.timestamp()).isEqualTo(now);
    }
}
