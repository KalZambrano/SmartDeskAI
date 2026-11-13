package pe.edu.utp.smartdesk.ticket;

import java.time.Instant;
import jakarta.persistence.*;

@Entity
@Table(name = "ticket_history")
public class TicketHistory {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(optional = false) @JoinColumn(name = "ticket_id", nullable = false)
    private Ticket ticket;
    @ManyToOne @JoinColumn(name = "actor_id")
    private pe.edu.utp.smartdesk.user.User actor;
    @Column(name = "event_type", nullable = false, length = 40)
    private String eventType;
    @Column(name = "old_value", length = 255)
    private String oldValue;
    @Column(name = "new_value", length = 255)
    private String newValue;
    @Column(nullable = false, length = 500)
    private String description;
    @Column(name = "created_at", nullable = false, insertable = false, updatable = false)
    private Instant createdAt;
    protected TicketHistory() {}
    public TicketHistory(Ticket ticket, pe.edu.utp.smartdesk.user.User actor, String type, String oldValue, String newValue, String description) {
        this.ticket=ticket; this.actor=actor; this.eventType=type; this.oldValue=oldValue; this.newValue=newValue; this.description=description;
    }
    public Long getId(){return id;}
    public String getEventType(){return eventType;}
    public String getDescription(){return description;}
    public Instant getCreatedAt(){return createdAt;}
}
