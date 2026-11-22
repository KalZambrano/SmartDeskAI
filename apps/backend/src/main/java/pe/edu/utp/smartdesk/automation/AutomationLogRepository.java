package pe.edu.utp.smartdesk.automation;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AutomationLogRepository extends JpaRepository<AutomationLog, Long> {
    @Modifying
    @Query(value = """
            insert into automation_logs (ticket_id, automation_type, execution_key, status, details)
            values (:ticketId, 'AUTO_ASSIGN', :executionKey, :status, :details)
            on conflict (execution_key) do nothing
            """, nativeQuery = true)
    int recordAssignment(@Param("ticketId") Long ticketId, @Param("executionKey") String executionKey,
            @Param("status") String status, @Param("details") String details);

    @Modifying
    @Query(value = """
            insert into automation_logs (ticket_id, automation_type, execution_key, status, details)
            values (:ticketId, 'ESCALATION', :executionKey, 'SUCCESS', :details)
            on conflict (execution_key) do nothing
            """, nativeQuery = true)
    int claimEscalation(@Param("ticketId") Long ticketId, @Param("executionKey") String executionKey,
            @Param("details") String details);
}
