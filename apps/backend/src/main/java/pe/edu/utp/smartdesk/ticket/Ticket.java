package pe.edu.utp.smartdesk.ticket;

import java.time.Instant;
import jakarta.persistence.*;

@Entity
@Table(name = "tickets")
public class Ticket {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "ticket_code", nullable = false, length = 20, unique = true)
    private String ticketCode;
    @Column(nullable = false, length = 150)
    private String title;
    @Column(nullable = false, length = 4000)
    private String description;
    @ManyToOne @JoinColumn(name = "category_id")
    private pe.edu.utp.smartdesk.category.Category category;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 10)
    private TicketPriority priority = TicketPriority.MEDIUM;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20)
    private TicketStatus status = TicketStatus.OPEN;
    @ManyToOne(optional = false) @JoinColumn(name = "requester_id", nullable = false)
    private pe.edu.utp.smartdesk.user.User requester;
    @ManyToOne @JoinColumn(name = "assigned_technician_id")
    private pe.edu.utp.smartdesk.user.User assignedTechnician;
    @Column(name = "ai_classification_source", nullable = false, length = 10)
    private String aiClassificationSource = "NONE";
    @Column(name = "due_at", nullable = false)
    private Instant dueAt;
    @Column(name = "resolved_at")
    private Instant resolvedAt;
    @Column(name = "created_at", nullable = false, insertable = false, updatable = false)
    private Instant createdAt;
    @Column(name = "updated_at", nullable = false, insertable = false, updatable = false)
    private Instant updatedAt;

    protected Ticket() {}
    public Ticket(String ticketCode, String title, String description, TicketPriority priority,
                  pe.edu.utp.smartdesk.user.User requester, Instant dueAt) {
        this.ticketCode = ticketCode; this.title = title; this.description = description;
        this.priority = priority; this.requester = requester; this.dueAt = dueAt;
    }
    public Long getId() { return id; }
    public String getTicketCode() { return ticketCode; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public pe.edu.utp.smartdesk.category.Category getCategory() { return category; }
    public TicketPriority getPriority() { return priority; }
    public TicketStatus getStatus() { return status; }
    public pe.edu.utp.smartdesk.user.User getRequester() { return requester; }
    public pe.edu.utp.smartdesk.user.User getAssignedTechnician() { return assignedTechnician; }
    public Instant getDueAt() { return dueAt; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getResolvedAt() { return resolvedAt; }
    public void setStatus(TicketStatus status) { this.status = status; this.resolvedAt = status == TicketStatus.RESOLVED ? Instant.now() : null; }
    public void setCategory(pe.edu.utp.smartdesk.category.Category category) { this.category = category; }
    public void update(String title, String description, TicketPriority priority) {
        this.title=title; this.description=description; this.priority=priority;
    }
    public void assign(pe.edu.utp.smartdesk.user.User technician) { this.assignedTechnician=technician; }
}
