package pe.edu.utp.smartdesk.dashboard;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.List;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import pe.edu.utp.smartdesk.ticket.Ticket;
import pe.edu.utp.smartdesk.ticket.TicketPriority;
import pe.edu.utp.smartdesk.ticket.TicketStatus;
import pe.edu.utp.smartdesk.user.User;
import pe.edu.utp.smartdesk.user.UserRepository;

@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardController {
    private final DashboardService dashboard;
    private final UserRepository users;

    public DashboardController(DashboardService dashboard, UserRepository users) {
        this.dashboard = dashboard;
        this.users = users;
    }

    @GetMapping("/summary")
    public DashboardSummary summary(Authentication auth,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to,
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(required = false) TicketPriority priority,
            @RequestParam(required = false) Long categoryId) {
        return dashboard.summary(dashboard.filteredTickets(actor(auth), parse(from), parse(to),
                status, priority, categoryId));
    }

    @GetMapping("/reports")
    public ReportData reports(Authentication auth,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to,
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(required = false) TicketPriority priority,
            @RequestParam(required = false) Long categoryId) {
        List<Ticket> items = dashboard.filteredTickets(actor(auth), parse(from), parse(to),
                status, priority, categoryId);
        return new ReportData(dashboard.summary(items), items.stream().map(DashboardController::row).toList());
    }

    @GetMapping("/reports/export")
    public ResponseEntity<byte[]> export(Authentication auth,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to,
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(required = false) TicketPriority priority,
            @RequestParam(required = false) Long categoryId) {
        List<Ticket> items = dashboard.filteredTickets(actor(auth), parse(from), parse(to),
                status, priority, categoryId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=smartdesk-report.csv")
                .contentType(MediaType.parseMediaType("text/csv;charset=UTF-8"))
                .body(dashboard.toCsv(items).getBytes(StandardCharsets.UTF_8));
    }

    private User actor(Authentication auth) {
        return users.findByEmailIgnoreCase(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
    }

    private static Instant parse(String value) {
        if (value == null || value.isBlank()) return null;
        try {
            return Instant.parse(value);
        } catch (RuntimeException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Fecha inválida");
        }
    }

    private static TicketRow row(Ticket ticket) {
        return new TicketRow(ticket.getTicketCode(), ticket.getTitle(), ticket.getPriority().name(),
                ticket.getStatus().name(),
                ticket.getCategory() == null ? null : ticket.getCategory().getName(),
                ticket.getAssignedTechnician() == null ? null : ticket.getAssignedTechnician().getFullName(),
                ticket.getCreatedAt(), ticket.getDueAt());
    }

    public record ReportData(DashboardSummary summary, List<TicketRow> tickets) {}

    public record TicketRow(String code, String title, String priority, String status, String category,
            String technician, Instant createdAt, Instant dueAt) {}
}
