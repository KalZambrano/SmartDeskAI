package pe.edu.utp.smartdesk.assignment;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TechnicianSpecialtyRepository extends JpaRepository<TechnicianSpecialty, Long> {
    List<TechnicianSpecialty> findByTechnicianIdOrderByCategoryNameAsc(Long technicianId);
    void deleteByTechnicianId(Long technicianId);
}
