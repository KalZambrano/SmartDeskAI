package pe.edu.utp.smartdesk.ticket;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByRequesterIdOrderByCreatedAtDesc(Long requesterId);
    List<Ticket> findByAssignedTechnicianIdOrderByCreatedAtDesc(Long technicianId);
    List<Ticket> findAllByOrderByCreatedAtDesc();

    /** Siguiente correlativo de ticket tomado de la secuencia de PostgreSQL. */
    @Query(value = "SELECT nextval('ticket_code_seq')", nativeQuery = true)
    Long nextTicketCode();
}
