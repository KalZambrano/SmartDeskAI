package pe.edu.utp.smartdesk.user;

import java.util.Optional;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmailIgnoreCase(String email);

    List<User> findByRoleAndActiveTrueOrderByIdAsc(Role role);

    @Query(value = """
            select u.id
            from users u
            join technician_specialties s on s.technician_id = u.id
            left join tickets t on t.assigned_technician_id = u.id
                and t.status not in ('RESOLVED', 'CLOSED')
            where u.role = 'TECHNICIAN' and u.active = true and s.category_id = :categoryId
            group by u.id
            order by count(t.id), u.id
            """, nativeQuery = true)
    List<Long> findEligibleTechnicianIds(@Param("categoryId") Long categoryId);
}
