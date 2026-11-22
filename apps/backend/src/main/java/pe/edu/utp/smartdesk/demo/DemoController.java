package pe.edu.utp.smartdesk.demo;

import java.time.Clock;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import pe.edu.utp.smartdesk.ticket.Ticket;
import pe.edu.utp.smartdesk.ticket.TicketRepository;

/** Utilidad controlada para la demostración: permite simular una incidencia vencida. */
@RestController
@RequestMapping("/api/v1/demo")
public class DemoController {
    private final TicketRepository tickets;
    private final Clock clock;
    private final boolean enabled;

    public DemoController(TicketRepository tickets, Clock clock,
            @Value("${smartdesk.demo-mode.enabled:false}") boolean enabled) {
        this.tickets = tickets;
        this.clock = clock;
        this.enabled = enabled;
    }

    @PostMapping("/tickets/{id}/overdue")
    @Transactional
    public Map<String, Object> markOverdue(@PathVariable Long id, Authentication auth) {
        if (!enabled) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        if (auth.getAuthorities().stream().noneMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
        Ticket ticket = tickets.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        Instant dueAt = clock.instant().minus(1, ChronoUnit.MINUTES);
        ticket.setDueAt(dueAt);
        tickets.save(ticket);
        return Map.of("ticketCode", ticket.getTicketCode(), "dueAt", dueAt.toString());
    }
}
