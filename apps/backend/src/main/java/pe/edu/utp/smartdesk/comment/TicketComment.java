package pe.edu.utp.smartdesk.comment;

import java.time.Instant;
import jakarta.persistence.*;

@Entity
@Table(name = "ticket_comments")
public class TicketComment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(optional = false) @JoinColumn(name = "ticket_id", nullable = false)
    private pe.edu.utp.smartdesk.ticket.Ticket ticket;
    @ManyToOne(optional = false) @JoinColumn(name = "author_id", nullable = false)
    private pe.edu.utp.smartdesk.user.User author;
    @Column(nullable = false, length = 2000)
    private String content;
    @Column(name = "created_at", nullable = false, insertable = false, updatable = false)
    private Instant createdAt;
    protected TicketComment() {}
    public TicketComment(pe.edu.utp.smartdesk.ticket.Ticket ticket, pe.edu.utp.smartdesk.user.User author, String content) { this.ticket=ticket; this.author=author; this.content=content; }
    public Long getId(){return id;}
    public String getContent(){return content;}
    public Instant getCreatedAt(){return createdAt;}
    public pe.edu.utp.smartdesk.user.User getAuthor(){return author;}
}
