package pe.edu.utp.smartdesk.assignment;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;

import pe.edu.utp.smartdesk.automation.AutomationLogRepository;
import pe.edu.utp.smartdesk.category.Category;
import pe.edu.utp.smartdesk.notification.NotificationService;
import pe.edu.utp.smartdesk.ticket.Ticket;
import pe.edu.utp.smartdesk.ticket.TicketHistoryRepository;
import pe.edu.utp.smartdesk.ticket.TicketRepository;
import pe.edu.utp.smartdesk.user.Role;
import pe.edu.utp.smartdesk.user.User;
import pe.edu.utp.smartdesk.user.UserRepository;

class TicketAssignmentServiceTest {

    private final UserRepository users = mock(UserRepository.class);
    private final TicketRepository tickets = mock(TicketRepository.class);
    private final TicketHistoryRepository history = mock(TicketHistoryRepository.class);
    private final AutomationLogRepository logs = mock(AutomationLogRepository.class);
    private final NotificationService notifications = mock(NotificationService.class);

    private TicketAssignmentService service() {
        return new TicketAssignmentService(users, tickets, history, logs, notifications);
    }

    @Test
    void assignsLeastLoadedEligibleTechnician() {
        Ticket ticket = ticketWithCategory(4L);
        User technician = user(2L, "tecnico2@test.local");
        when(users.findEligibleTechnicianIds(4L)).thenReturn(List.of(2L, 3L));
        when(users.findById(2L)).thenReturn(Optional.of(technician));

        assertThat(service().assignAutomatically(ticket)).isEqualTo(technician);

        verify(ticket).assign(technician);
        verify(tickets).save(ticket);
        verify(history).save(any());
        verify(logs).recordAssignment(eq(1L), eq("AUTO_ASSIGN:1"), eq("SUCCESS"), anyString());
        verify(notifications).notify(eq(technician), eq(ticket), anyString(), anyString());
    }

    @Test
    void leavesTicketUnassignedAndAlertsAdminsWhenNoTechnicianIsEligible() {
        Ticket ticket = ticketWithCategory(4L);
        User admin = user(1L, "admin@test.local");
        when(users.findEligibleTechnicianIds(4L)).thenReturn(List.of());
        when(users.findByRoleAndActiveTrueOrderByIdAsc(Role.ADMIN)).thenReturn(List.of(admin));

        assertThat(service().assignAutomatically(ticket)).isNull();

        verify(ticket, never()).assign(any());
        verify(logs).recordAssignment(eq(1L), eq("AUTO_ASSIGN:1"), eq("UNASSIGNED"), anyString());
        verify(notifications).notifyAll(List.of(admin), ticket,
                "Incidencia sin asignar: SD-000001", "No hay un técnico activo con especialidad para "
                        + ticket.getCategory().getName() + ".");
    }

    private Ticket ticketWithCategory(long categoryId) {
        Category category = mock(Category.class);
        when(category.getId()).thenReturn(categoryId);
        when(category.getName()).thenReturn("Redes");
        Ticket ticket = mock(Ticket.class);
        when(ticket.getId()).thenReturn(1L);
        when(ticket.getTicketCode()).thenReturn("SD-000001");
        when(ticket.getCategory()).thenReturn(category);
        return ticket;
    }

    private User user(long id, String email) {
        User user = mock(User.class);
        when(user.getId()).thenReturn(id);
        when(user.getEmail()).thenReturn(email);
        return user;
    }
}
