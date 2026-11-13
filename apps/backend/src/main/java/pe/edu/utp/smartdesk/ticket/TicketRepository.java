package pe.edu.utp.smartdesk.ticket;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByRequesterIdOrderByCreatedAtDesc(Long requesterId);
    List<Ticket> findByAssignedTechnicianIdOrderByCreatedAtDesc(Long technicianId);
    List<Ticket> findAllByOrderByCreatedAtDesc();
}
