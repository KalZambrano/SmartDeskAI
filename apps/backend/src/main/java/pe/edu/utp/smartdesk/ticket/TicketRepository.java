package pe.edu.utp.smartdesk.ticket;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByRequesterIdOrderByCreatedAtDesc(Long requesterId);
    List<Ticket> findByAssignedTechnicianIdOrderByCreatedAtDesc(Long technicianId);
    List<Ticket> findAllByOrderByCreatedAtDesc();

    /** Listado filtrado en base de datos; los parámetros nulos se ignoran. */
    @Query("""
            select t from Ticket t
            where (:requesterId is null or t.requester.id = :requesterId)
              and (:technicianId is null or t.assignedTechnician.id = :technicianId)
              and (:status is null or t.status = :status)
              and (:priority is null or t.priority = :priority)
              and (:categoryId is null or t.category.id = :categoryId)
              and (:q is null or lower(t.ticketCode) like lower(concat('%', cast(:q as string), '%'))
                              or lower(t.title) like lower(concat('%', cast(:q as string), '%')))
            order by t.createdAt desc
            """)
    List<Ticket> search(@Param("requesterId") Long requesterId,
            @Param("technicianId") Long technicianId,
            @Param("status") TicketStatus status,
            @Param("priority") TicketPriority priority,
            @Param("categoryId") Long categoryId,
            @Param("q") String q);

    /** Siguiente correlativo de ticket tomado de la secuencia de PostgreSQL. */
    @Query(value = "SELECT nextval('ticket_code_seq')", nativeQuery = true)
    Long nextTicketCode();
}
