package pe.edu.utp.smartdesk.automation;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.time.Instant;
import java.util.List;

import org.junit.jupiter.api.Test;

import pe.edu.utp.smartdesk.notification.NotificationService;
import pe.edu.utp.smartdesk.ticket.Ticket;
import pe.edu.utp.smartdesk.ticket.TicketHistoryRepository;
import pe.edu.utp.smartdesk.ticket.TicketPriority;
import pe.edu.utp.smartdesk.ticket.TicketRepository;
import pe.edu.utp.smartdesk.ticket.TicketStatus;
import pe.edu.utp.smartdesk.user.Role;
import pe.edu.utp.smartdesk.user.User;
import pe.edu.utp.smartdesk.user.UserRepository;

class TicketAutomationServiceTest {

    private final TicketRepository tickets = mock(TicketRepository.class);
    private final UserRepository users = mock(UserRepository.class);
    private final AutomationLogRepository logs = mock(AutomationLogRepository.class);
    private final TicketHistoryRepository history = mock(TicketHistoryRepository.class);
    private final NotificationService notifications = mock(NotificationService.class);
    private final Clock clock = mock(Clock.class);
    private final Instant now = Instant.parse("2026-11-21T12:00:00Z");

    private TicketAutomationService service() {
        return new TicketAutomationService(tickets, users, logs, history, notifications, clock);
    }

    @Test
    void escalatesOverdueTicketOnceAndIsIdempotentOnRerun() {
        Ticket ticket = overdueTicket();
        User technician = user(2L);
        User admin = user(1L);
        when(clock.instant()).thenReturn(now);
        when(tickets.findByDueAtLessThanEqualAndStatusInOrderByDueAtAsc(eq(now), anyList()))
                .thenReturn(List.of(ticket));
        when(ticket.getAssignedTechnician()).thenReturn(technician);
        when(users.findByRoleAndActiveTrueOrderByIdAsc(Role.ADMIN)).thenReturn(List.of(admin));
        when(logs.claimEscalation(eq(5L), eq("ESCALATION:5"), anyString())).thenReturn(1, 0);

        TicketAutomationService automation = service();
        assertThat(automation.escalateOverdueTickets()).isEqualTo(1);
        assertThat(automation.escalateOverdueTickets()).isZero();

        verify(history, times(1)).save(any());
        verify(notifications, times(1)).notify(technician, ticket,
                "Incidencia vencida: SD-000005",
                "La incidencia SD-000005 superó su tiempo objetivo de atención.");
        verify(notifications, times(1)).notifyAll(List.of(admin), ticket,
                "Incidencia vencida: SD-000005",
                "La incidencia SD-000005 superó su tiempo objetivo de atención.");
        verify(logs, times(2)).claimEscalation(eq(5L), eq("ESCALATION:5"), anyString());
    }

    @Test
    void ignoresTicketsThatAreNotOverdue() {
        when(clock.instant()).thenReturn(now);
        when(tickets.findByDueAtLessThanEqualAndStatusInOrderByDueAtAsc(eq(now), anyList()))
                .thenReturn(List.of());

        assertThat(service().escalateOverdueTickets()).isZero();

        verify(logs, org.mockito.Mockito.never()).claimEscalation(any(), anyString(), anyString());
        verify(history, org.mockito.Mockito.never()).save(any());
    }

    private Ticket overdueTicket() {
        Ticket ticket = mock(Ticket.class);
        when(ticket.getId()).thenReturn(5L);
        when(ticket.getTicketCode()).thenReturn("SD-000005");
        when(ticket.getPriority()).thenReturn(TicketPriority.HIGH);
        when(ticket.getStatus()).thenReturn(TicketStatus.OPEN);
        return ticket;
    }

    private User user(long id) {
        User user = mock(User.class);
        when(user.getId()).thenReturn(id);
        return user;
    }
}
