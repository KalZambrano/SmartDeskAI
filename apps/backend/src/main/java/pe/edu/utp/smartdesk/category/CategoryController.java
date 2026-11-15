package pe.edu.utp.smartdesk.category;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1/categories")
public class CategoryController {
    private final CategoryRepository categories;

    public CategoryController(CategoryRepository categories) {
        this.categories = categories;
    }

    @GetMapping
    public List<CategoryDto> listActive() {
        return categories.findByActiveTrueOrderByNameAsc().stream()
                .map(CategoryController::toDto).toList();
    }

    @GetMapping("/manage")
    public List<CategoryDto> listAllForAdministration() {
        return categories.findAllByOrderByNameAsc().stream()
                .map(CategoryController::toDto).toList();
    }

    @PostMapping
    public CategoryDto create(@Valid @RequestBody CategoryRequest request) {
        String name = request.name().trim();
        String code = normalizeCode(request.code());
        ensureUnique(name, code, null);
        Category category = categories.save(new Category(name, code, cleanDescription(request.description())));
        return toDto(category);
    }

    @PutMapping("/{id}")
    public CategoryDto update(@PathVariable Long id, @Valid @RequestBody CategoryRequest request) {
        Category category = findCategory(id);
        String name = request.name().trim();
        String code = normalizeCode(request.code());
        ensureUnique(name, code, id);
        category.update(name, code, cleanDescription(request.description()));
        if (request.active() != null) category.setActive(request.active());
        return toDto(categories.save(category));
    }

    @DeleteMapping("/{id}")
    public void deactivate(@PathVariable Long id) {
        Category category = findCategory(id);
        category.setActive(false);
        categories.save(category);
    }

    private Category findCategory(Long id) {
        return categories.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Categoría no encontrada"));
    }

    private void ensureUnique(String name, String code, Long currentId) {
        boolean nameExists = currentId == null
                ? categories.existsByNameIgnoreCase(name)
                : categories.existsByNameIgnoreCaseAndIdNot(name, currentId);
        boolean codeExists = currentId == null
                ? categories.existsByCodeIgnoreCase(code)
                : categories.existsByCodeIgnoreCaseAndIdNot(code, currentId);
        if (nameExists || codeExists) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El nombre o código ya está registrado");
        }
    }

    private static String normalizeCode(String code) {
        return code.trim().toUpperCase();
    }

    private static String cleanDescription(String description) {
        return description == null || description.isBlank() ? null : description.trim();
    }

    private static CategoryDto toDto(Category category) {
        return new CategoryDto(category.getId(), category.getName(), category.getCode(),
                category.getDescription(), category.isActive());
    }

    public record CategoryRequest(
            @NotBlank @Size(max = 80) String name,
            @NotBlank @Size(max = 30) @Pattern(regexp = "[A-Za-z0-9_-]+") String code,
            @Size(max = 255) String description,
            Boolean active) {}

    public record CategoryDto(Long id, String name, String code, String description, boolean active) {}
}
