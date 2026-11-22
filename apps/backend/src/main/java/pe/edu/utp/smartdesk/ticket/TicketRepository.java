package pe.edu.utp.smartdesk.ticket;

import java.util.List;
import java.time.Instant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByRequesterIdOrderByCreatedAtDesc(Long requesterId);
    List<Ticket> findByAssignedTechnicianIdOrderByCreatedAtDesc(Long technicianId);
    List<Ticket> findAllByOrderByCreatedAtDesc();
    List<Ticket> findByDueAtLessThanEqualAndStatusInOrderByDueAtAsc(Instant now, List<TicketStatus> statuses);

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
            order by t.createdAt desc, t.id desc
            """)
    Page<Ticket> search(@Param("requesterId") Long requesterId,
            @Param("technicianId") Long technicianId,
            @Param("status") TicketStatus status,
            @Param("priority") TicketPriority priority,
            @Param("categoryId") Long categoryId,
            @Param("q") String q, Pageable pageable);

    /** Variante sin paginar para los agregados del dashboard. */
    default List<Ticket> search(Long requesterId, Long technicianId, TicketStatus status,
            TicketPriority priority, Long categoryId, String q) {
        return search(requesterId, technicianId, status, priority, categoryId, q,
                Pageable.unpaged()).getContent();
    }

    /** Siguiente correlativo de ticket tomado de la secuencia de PostgreSQL. */
    @Query(value = "SELECT nextval('ticket_code_seq')", nativeQuery = true)
    Long nextTicketCode();
}
