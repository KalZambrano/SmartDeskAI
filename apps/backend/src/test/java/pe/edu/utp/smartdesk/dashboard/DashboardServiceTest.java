package pe.edu.utp.smartdesk.dashboard;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

import org.junit.jupiter.api.Test;

import pe.edu.utp.smartdesk.category.Category;
import pe.edu.utp.smartdesk.ticket.Ticket;
import pe.edu.utp.smartdesk.ticket.TicketPriority;
import pe.edu.utp.smartdesk.ticket.TicketRepository;
import pe.edu.utp.smartdesk.ticket.TicketStatus;
import pe.edu.utp.smartdesk.user.Role;
import pe.edu.utp.smartdesk.user.User;

class DashboardServiceTest {

    private final TicketRepository tickets = mock(TicketRepository.class);
    private final Clock clock = mock(Clock.class);
    private final Instant now = Instant.parse("2026-11-21T12:00:00Z");
    private final DashboardService service = new DashboardService(tickets, clock);

    @Test
    void computesIndicatorsFromFilteredTickets() {
        when(clock.instant()).thenReturn(now);
        Category network = category("Redes");
        Category software = category("Software");
        User technician = user("Técnico");
        List<Ticket> items = List.of(
                ticket(TicketStatus.OPEN, TicketPriority.HIGH, network, technician, now.minus(1, ChronoUnit.HOURS), null),
                ticket(TicketStatus.IN_PROGRESS, TicketPriority.MEDIUM, network, technician, now.plus(1, ChronoUnit.HOURS), null),
                ticket(TicketStatus.RESOLVED, TicketPriority.LOW, software, null, now.plus(1, ChronoUnit.HOURS),
                        now.minus(1, ChronoUnit.DAYS).plus(2, ChronoUnit.HOURS)),
                ticket(TicketStatus.CLOSED, TicketPriority.CRITICAL, null, user("Otro"), now.plus(1, ChronoUnit.HOURS), null));

        DashboardSummary summary = service.summary(items);

        assertThat(summary.total()).isEqualTo(4);
        assertThat(summary.open()).isEqualTo(1);
        assertThat(summary.inProgress()).isEqualTo(1);
        assertThat(summary.pending()).isZero();
        assertThat(summary.resolved()).isEqualTo(1);
        assertThat(summary.closed()).isEqualTo(1);
        assertThat(summary.overdue()).isEqualTo(1);
        assertThat(summary.averageResolutionHours()).isEqualTo(2.0);
        assertThat(summary.byPriority()).containsEntry("HIGH", 1L).containsEntry("CRITICAL", 1L);
        assertThat(summary.byCategory()).containsEntry("Redes", 2L).containsEntry("Sin categoría", 1L);
        assertThat(summary.workload()).containsExactly(new DashboardSummary.WorkloadItem("Técnico", 2));
        assertThat(summary.timeline()).hasSize(14);
        assertThat(summary.timeline().getFirst())
                .isEqualTo(new DashboardSummary.TimelinePoint("2026-11-08", 0, 0));
        assertThat(summary.timeline().getLast())
                .isEqualTo(new DashboardSummary.TimelinePoint("2026-11-21", 0, 0));
        assertThat(summary.timeline().stream()
                .filter(point -> point.date().equals("2026-11-20")).findFirst().orElseThrow())
                .isEqualTo(new DashboardSummary.TimelinePoint("2026-11-20", 4, 1));
    }

    @Test
    void scopesTicketsByRole() {
        User requester = user("Solicitante");
        when(requester.getRole()).thenReturn(Role.REQUESTER);
        when(requester.getId()).thenReturn(7L);
        when(tickets.search(7L, null, null, null, null, null)).thenReturn(List.of());

        service.filteredTickets(requester, null, null, null, null, null);

        verify(tickets).search(7L, null, null, null, null, null);
    }

    @Test
    void csvEscapesCellsThatCouldStartAFormula() {
        Ticket ticket = ticket(TicketStatus.OPEN, TicketPriority.HIGH, category("Redes"), user("Técnico"),
                now, null);
        when(ticket.getTicketCode()).thenReturn("=CMD()");

        assertThat(service.toCsv(List.of(ticket))).contains("'=CMD()");
    }

    private Ticket ticket(TicketStatus status, TicketPriority priority, Category category, User technician,
            Instant dueAt, Instant resolvedAt) {
        Ticket ticket = mock(Ticket.class);
        when(ticket.getStatus()).thenReturn(status);
        when(ticket.getPriority()).thenReturn(priority);
        when(ticket.getCategory()).thenReturn(category);
        when(ticket.getAssignedTechnician()).thenReturn(technician);
        when(ticket.getCreatedAt()).thenReturn(now.minus(1, ChronoUnit.DAYS));
        when(ticket.getDueAt()).thenReturn(dueAt);
        when(ticket.getResolvedAt()).thenReturn(resolvedAt);
        return ticket;
    }

    private Category category(String name) {
        Category category = mock(Category.class);
        when(category.getName()).thenReturn(name);
        return category;
    }

    private User user(String fullName) {
        User user = mock(User.class);
        when(user.getFullName()).thenReturn(fullName);
        return user;
    }
}
