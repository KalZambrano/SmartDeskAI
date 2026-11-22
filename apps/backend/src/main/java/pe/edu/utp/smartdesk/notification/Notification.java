package pe.edu.utp.smartdesk.notification;

import java.time.Instant;
import jakarta.persistence.*;
import pe.edu.utp.smartdesk.ticket.Ticket;
import pe.edu.utp.smartdesk.user.User;

@Entity
@Table(name = "notifications")
public class Notification {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(optional = false) @JoinColumn(name = "user_id", nullable = false)
    private User user;
    @ManyToOne @JoinColumn(name = "ticket_id")
    private Ticket ticket;
    @Column(nullable = false, length = 150)
    private String title;
    @Column(nullable = false, length = 500)
    private String message;
    @Column(name = "read_at")
    private Instant readAt;
    @Column(name = "created_at", nullable = false, insertable = false, updatable = false)
    private Instant createdAt;

    protected Notification() {}

    public Notification(User user, Ticket ticket, String title, String message) {
        this.user = user;
        this.ticket = ticket;
        this.title = title;
        this.message = message;
    }

    public Long getId() { return id; }
    public User getUser() { return user; }
    public Ticket getTicket() { return ticket; }
    public String getTitle() { return title; }
    public String getMessage() { return message; }
    public Instant getReadAt() { return readAt; }
    public Instant getCreatedAt() { return createdAt; }

    public void markRead(Instant at) {
        if (readAt == null) readAt = at;
    }
}
