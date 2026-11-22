package pe.edu.utp.smartdesk.demo;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.server.ResponseStatusException;

import pe.edu.utp.smartdesk.ticket.Ticket;
import pe.edu.utp.smartdesk.ticket.TicketRepository;

class DemoControllerTest {

    private final TicketRepository tickets = mock(TicketRepository.class);
    private final Clock clock = mock(Clock.class);
    private final Instant now = Instant.parse("2026-11-21T12:00:00Z");
    private final Authentication admin = authWith("ROLE_ADMIN");

    @Test
    void disabledModeReturnsNotFound() {
        Ticket ticket = ticket();
        when(tickets.findById(3L)).thenReturn(Optional.of(ticket));

        assertThatThrownBy(() -> controller(false).markOverdue(3L, admin))
                .isInstanceOfSatisfying(ResponseStatusException.class,
                        e -> assertThat(e.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND));
        verify(ticket, never()).setDueAt(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void adminCanMarkTicketOverdueWhenEnabled() {
        Ticket ticket = ticket();
        when(clock.instant()).thenReturn(now);
        when(tickets.findById(3L)).thenReturn(Optional.of(ticket));

        assertThat(controller(true).markOverdue(3L, admin)).containsEntry("ticketCode", "SD-000003");

        verify(ticket).setDueAt(now.minus(1, ChronoUnit.MINUTES));
        verify(tickets).save(ticket);
    }

    @Test
    void nonAdminIsRejectedEvenWhenEnabled() {
        assertThatThrownBy(() -> controller(true).markOverdue(3L, authWith("ROLE_REQUESTER")))
                .isInstanceOfSatisfying(ResponseStatusException.class,
                        e -> assertThat(e.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN));
    }

    private DemoController controller(boolean enabled) {
        return new DemoController(tickets, clock, enabled);
    }

    private Ticket ticket() {
        Ticket ticket = mock(Ticket.class);
        when(ticket.getTicketCode()).thenReturn("SD-000003");
        return ticket;
    }

    private Authentication authWith(String role) {
        Authentication auth = mock(Authentication.class);
        doReturn(List.of(new SimpleGrantedAuthority(role))).when(auth).getAuthorities();
        return auth;
    }
}
