package pe.edu.utp.smartdesk.assignment;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import pe.edu.utp.smartdesk.category.Category;
import pe.edu.utp.smartdesk.category.CategoryRepository;
import pe.edu.utp.smartdesk.user.Role;
import pe.edu.utp.smartdesk.user.User;
import pe.edu.utp.smartdesk.user.UserRepository;

@Service
public class TechnicianSpecialtyService {
    private final TechnicianSpecialtyRepository specialties;
    private final UserRepository users;
    private final CategoryRepository categories;

    public TechnicianSpecialtyService(TechnicianSpecialtyRepository specialties, UserRepository users,
            CategoryRepository categories) {
        this.specialties = specialties;
        this.users = users;
        this.categories = categories;
    }

    @Transactional(readOnly = true)
    public List<SpecialtyDto> list(Long technicianId) {
        requireTechnician(technicianId);
        return specialties.findByTechnicianIdOrderByCategoryNameAsc(technicianId).stream()
                .map(s -> new SpecialtyDto(s.getCategory().getId(), s.getCategory().getName())).toList();
    }

    @Transactional
    public List<SpecialtyDto> replace(Long technicianId, List<Long> categoryIds) {
        User technician = requireTechnician(technicianId);
        List<Long> uniqueIds = categoryIds == null ? List.of() : categoryIds.stream().distinct().toList();
        List<Category> activeCategories = categories.findByActiveTrueOrderByNameAsc().stream()
                .filter(category -> uniqueIds.contains(category.getId())).toList();
        if (activeCategories.size() != uniqueIds.size()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Una o más categorías no son válidas");
        }
        specialties.deleteByTechnicianId(technicianId);
        specialties.saveAll(activeCategories.stream()
                .map(category -> new TechnicianSpecialty(technician, category)).toList());
        return list(technicianId);
    }

    private User requireTechnician(Long id) {
        User user = users.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (user.getRole() != Role.TECHNICIAN) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El usuario no tiene rol de técnico");
        }
        return user;
    }

    public record SpecialtyDto(Long categoryId, String categoryName) {}
}
