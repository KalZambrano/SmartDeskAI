package pe.edu.utp.smartdesk.automation;

import java.time.Instant;
import jakarta.persistence.*;
import pe.edu.utp.smartdesk.ticket.Ticket;

@Entity
@Table(name = "automation_logs")
public class AutomationLog {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne @JoinColumn(name = "ticket_id")
    private Ticket ticket;
    @Column(name = "automation_type", nullable = false, length = 40)
    private String automationType;
    @Column(name = "execution_key", length = 120, unique = true)
    private String executionKey;
    @Column(nullable = false, length = 20)
    private String status;
    @Column(length = 1000)
    private String details;
    @Column(name = "executed_at", nullable = false, insertable = false, updatable = false)
    private Instant executedAt;

    protected AutomationLog() {}
}
