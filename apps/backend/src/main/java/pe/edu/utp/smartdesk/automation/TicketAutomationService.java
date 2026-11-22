package pe.edu.utp.smartdesk.automation;

import java.time.Clock;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.utp.smartdesk.notification.NotificationService;
import pe.edu.utp.smartdesk.ticket.Ticket;
import pe.edu.utp.smartdesk.ticket.TicketHistory;
import pe.edu.utp.smartdesk.ticket.TicketHistoryRepository;
import pe.edu.utp.smartdesk.ticket.TicketRepository;
import pe.edu.utp.smartdesk.ticket.TicketStatus;
import pe.edu.utp.smartdesk.user.Role;
import pe.edu.utp.smartdesk.user.User;
import pe.edu.utp.smartdesk.user.UserRepository;

@Service
public class TicketAutomationService {
    private final TicketRepository tickets;
    private final UserRepository users;
    private final AutomationLogRepository logs;
    private final TicketHistoryRepository history;
    private final NotificationService notifications;
    private final Clock clock;

    public TicketAutomationService(TicketRepository tickets, UserRepository users, AutomationLogRepository logs,
            TicketHistoryRepository history, NotificationService notifications, Clock clock) {
        this.tickets = tickets;
        this.users = users;
        this.logs = logs;
        this.history = history;
        this.notifications = notifications;
        this.clock = clock;
    }

    @Transactional
    public int escalateOverdueTickets() {
        List<Ticket> overdue = tickets.findByDueAtLessThanEqualAndStatusInOrderByDueAtAsc(clock.instant(),
                List.of(TicketStatus.OPEN, TicketStatus.IN_PROGRESS, TicketStatus.PENDING));
        List<User> admins = users.findByRoleAndActiveTrueOrderByIdAsc(Role.ADMIN);
        int escalated = 0;
        for (Ticket ticket : overdue) {
            String key = "ESCALATION:" + ticket.getId();
            String details = "Incidencia vencida; prioridad " + ticket.getPriority().name();
            if (logs.claimEscalation(ticket.getId(), key, details) == 0) continue;

            history.save(new TicketHistory(ticket, null, "ESCALATED", null, ticket.getPriority().name(),
                    "La incidencia superó su tiempo objetivo y fue escalada"));
            String title = "Incidencia vencida: " + ticket.getTicketCode();
            String message = "La incidencia " + ticket.getTicketCode() + " superó su tiempo objetivo de atención.";
            if (ticket.getAssignedTechnician() != null) {
                notifications.notify(ticket.getAssignedTechnician(), ticket, title, message);
            }
            notifications.notifyAll(admins, ticket, title, message);
            escalated++;
        }
        return escalated;
    }
}
