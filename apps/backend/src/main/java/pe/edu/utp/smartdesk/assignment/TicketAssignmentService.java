package pe.edu.utp.smartdesk.assignment;

import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.utp.smartdesk.automation.AutomationLogRepository;
import pe.edu.utp.smartdesk.notification.NotificationService;
import pe.edu.utp.smartdesk.ticket.Ticket;
import pe.edu.utp.smartdesk.ticket.TicketHistory;
import pe.edu.utp.smartdesk.ticket.TicketHistoryRepository;
import pe.edu.utp.smartdesk.ticket.TicketRepository;
import pe.edu.utp.smartdesk.user.Role;
import pe.edu.utp.smartdesk.user.User;
import pe.edu.utp.smartdesk.user.UserRepository;

@Service
public class TicketAssignmentService {
    private final UserRepository users;
    private final TicketRepository tickets;
    private final TicketHistoryRepository history;
    private final AutomationLogRepository logs;
    private final NotificationService notifications;

    public TicketAssignmentService(UserRepository users, TicketRepository tickets, TicketHistoryRepository history,
            AutomationLogRepository logs, NotificationService notifications) {
        this.users = users;
        this.tickets = tickets;
        this.history = history;
        this.logs = logs;
        this.notifications = notifications;
    }

    @Transactional
    public User assignAutomatically(Ticket ticket) {
        List<Long> candidates = ticket.getCategory() == null ? List.of()
                : users.findEligibleTechnicianIds(ticket.getCategory().getId());
        if (candidates.isEmpty()) {
            logs.recordAssignment(ticket.getId(), "AUTO_ASSIGN:" + ticket.getId(), "UNASSIGNED",
                    "No existe técnico activo con especialidad para la categoría");
            notifications.notifyAll(users.findByRoleAndActiveTrueOrderByIdAsc(Role.ADMIN), ticket,
                    "Incidencia sin asignar: " + ticket.getTicketCode(),
                    "No hay un técnico activo con especialidad para "
                            + (ticket.getCategory() == null ? "la categoría de esta incidencia" : ticket.getCategory().getName()) + ".");
            return null;
        }

        User technician = users.findById(candidates.getFirst()).orElseThrow();
        ticket.assign(technician);
        tickets.save(ticket);
        history.save(new TicketHistory(ticket, null, "ASSIGNED", null, technician.getEmail(),
                "Incidencia asignada automáticamente al técnico con menor carga"));
        logs.recordAssignment(ticket.getId(), "AUTO_ASSIGN:" + ticket.getId(), "SUCCESS",
                "Asignada automáticamente a " + technician.getEmail());
        notifications.notify(technician, ticket, "Nueva incidencia asignada: " + ticket.getTicketCode(),
                "Se te asignó la incidencia " + ticket.getTicketCode() + ".");
        return technician;
    }

    @Transactional
    public void notifyManualAssignment(Ticket ticket, User previousTechnician, User technician, User actor) {
        if (previousTechnician != null && previousTechnician.getId().equals(technician.getId())) return;
        ticket.assign(technician);
        tickets.save(ticket);
        history.save(new TicketHistory(ticket, actor, "ASSIGNED",
                previousTechnician == null ? null : previousTechnician.getEmail(), technician.getEmail(),
                previousTechnician == null ? "Incidencia asignada" : "Incidencia reasignada"));
        if (previousTechnician != null && !previousTechnician.getId().equals(technician.getId())) {
            notifications.notify(previousTechnician, ticket, "Incidencia reasignada: " + ticket.getTicketCode(),
                    "La incidencia " + ticket.getTicketCode() + " fue reasignada a otro técnico.");
        }
        notifications.notify(technician, ticket, "Incidencia asignada: " + ticket.getTicketCode(),
                "Se te asignó la incidencia " + ticket.getTicketCode() + ".");
    }
}
