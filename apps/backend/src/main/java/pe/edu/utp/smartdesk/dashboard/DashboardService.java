package pe.edu.utp.smartdesk.dashboard;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import pe.edu.utp.smartdesk.ticket.Ticket;
import pe.edu.utp.smartdesk.ticket.TicketPriority;
import pe.edu.utp.smartdesk.ticket.TicketRepository;
import pe.edu.utp.smartdesk.ticket.TicketStatus;
import pe.edu.utp.smartdesk.user.Role;
import pe.edu.utp.smartdesk.user.User;

/**
 * Indicadores calculados sobre el listado filtrado.
 * ponytail: escaneo O(n) en memoria; suficiente para el volumen académico, migrar a consultas
 * agregadas de JPA si el número de incidencias crece.
 */
@Service
public class DashboardService {
    private final TicketRepository tickets;
    private final Clock clock;

    public DashboardService(TicketRepository tickets, Clock clock) {
        this.tickets = tickets;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public List<Ticket> filteredTickets(User actor, Instant from, Instant to, TicketStatus status,
            TicketPriority priority, Long categoryId) {
        Long requesterId = actor.getRole() == Role.REQUESTER ? actor.getId() : null;
        Long technicianId = actor.getRole() == Role.TECHNICIAN ? actor.getId() : null;
        return tickets.search(requesterId, technicianId, status, priority, categoryId, null).stream()
                .filter(ticket -> from == null || !ticket.getCreatedAt().isBefore(from))
                .filter(ticket -> to == null || !ticket.getCreatedAt().isAfter(to))
                .toList();
    }

    @Transactional(readOnly = true)
    public DashboardSummary summary(List<Ticket> items) {
        Instant now = clock.instant();
        Map<String, Long> byPriority = new LinkedHashMap<>();
        for (TicketPriority priority : TicketPriority.values()) byPriority.put(priority.name(), 0L);
        Map<String, Long> byCategory = new LinkedHashMap<>();
        Map<String, Long> workload = new LinkedHashMap<>();

        for (Ticket ticket : items) {
            byPriority.merge(ticket.getPriority().name(), 1L, Long::sum);
            String category = ticket.getCategory() == null ? "Sin categoría" : ticket.getCategory().getName();
            byCategory.merge(category, 1L, Long::sum);
            if (isActive(ticket.getStatus())) {
                String technician = ticket.getAssignedTechnician() == null
                        ? "Sin asignar" : ticket.getAssignedTechnician().getFullName();
                workload.merge(technician, 1L, Long::sum);
            }
        }

        double average = items.stream()
                .filter(ticket -> ticket.getResolvedAt() != null)
                .mapToLong(ticket -> Duration.between(ticket.getCreatedAt(), ticket.getResolvedAt()).toMinutes())
                .average().orElse(0) / 60.0;

        List<DashboardSummary.WorkloadItem> workloadItems = workload.entrySet().stream()
                .map(entry -> new DashboardSummary.WorkloadItem(entry.getKey(), entry.getValue()))
                .sorted((a, b) -> Long.compare(b.activeTickets(), a.activeTickets()))
                .toList();

        return new DashboardSummary(
                items.size(),
                count(items, TicketStatus.OPEN),
                count(items, TicketStatus.IN_PROGRESS),
                count(items, TicketStatus.PENDING),
                count(items, TicketStatus.RESOLVED),
                count(items, TicketStatus.CLOSED),
                items.stream().filter(ticket -> isActive(ticket.getStatus()) && ticket.getDueAt().isBefore(now)).count(),
                Math.round(average * 100.0) / 100.0,
                byPriority,
                byCategory,
                workloadItems);
    }

    public String toCsv(List<Ticket> items) {
        StringBuilder csv = new StringBuilder("codigo;titulo;prioridad;estado;categoria;tecnico;creado;vencimiento\n");
        for (Ticket ticket : items) {
            csv.append(cell(ticket.getTicketCode())).append(';')
                    .append(cell(ticket.getTitle())).append(';')
                    .append(cell(ticket.getPriority().name())).append(';')
                    .append(cell(ticket.getStatus().name())).append(';')
                    .append(cell(ticket.getCategory() == null ? "" : ticket.getCategory().getName())).append(';')
                    .append(cell(ticket.getAssignedTechnician() == null ? "" : ticket.getAssignedTechnician().getFullName())).append(';')
                    .append(cell(ticket.getCreatedAt() == null ? "" : ticket.getCreatedAt().toString())).append(';')
                    .append(cell(ticket.getDueAt() == null ? "" : ticket.getDueAt().toString())).append('\n');
        }
        return csv.toString();
    }

    private static long count(List<Ticket> items, TicketStatus status) {
        return items.stream().filter(ticket -> ticket.getStatus() == status).count();
    }

    private static boolean isActive(TicketStatus status) {
        return status == TicketStatus.OPEN || status == TicketStatus.IN_PROGRESS || status == TicketStatus.PENDING;
    }

    private static String cell(String value) {
        String safe = value == null ? "" : value.replace("\"", "''");
        return safe.matches("^[=+\\-@].*") ? "'" + safe : safe;
    }
}
