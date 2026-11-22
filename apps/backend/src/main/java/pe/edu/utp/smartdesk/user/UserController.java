package pe.edu.utp.smartdesk.user;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import pe.edu.utp.smartdesk.assignment.TechnicianSpecialtyService;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {
    private final UserRepository users;
    private final TechnicianSpecialtyService specialties;
    private final BCryptPasswordEncoder passwords=new BCryptPasswordEncoder();
    public UserController(UserRepository users, TechnicianSpecialtyService specialties) {
        this.users=users;
        this.specialties=specialties;
    }
    @GetMapping
    public List<UserDto> list() {
        return users.findAll().stream().map(u->new UserDto(u.getId(),u.getFullName(),u.getEmail(),u.getRole().name(),u.isActive())).toList();
    }
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserDto create(@RequestBody CreateUserRequest req) {
        if(req.fullName()==null || req.fullName().isBlank() || req.email()==null || !req.email().contains("@")
                || req.password()==null || req.password().length()<12 || req.role()==null)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Datos inválidos; la clave debe tener al menos 12 caracteres");
        Role role=parseRole(req.role());
        String email=req.email().trim().toLowerCase();
        if(users.findByEmailIgnoreCase(email).isPresent()) throw new ResponseStatusException(HttpStatus.CONFLICT,"Correo ya registrado");
        User u=users.save(new User(req.fullName().trim(),email,passwords.encode(req.password()),role));
        return toDto(u);
    }
    @PutMapping("/{id}")
    public UserDto update(@PathVariable Long id, @RequestBody UpdateUserRequest req) {
        if(req.fullName()==null || req.fullName().isBlank() || req.fullName().trim().length()>120
                || req.email()==null || !req.email().contains("@") || req.email().trim().length()>255
                || req.role()==null)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Datos inválidos");
        User user=users.findById(id).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND,"Usuario no encontrado"));
        String email=req.email().trim().toLowerCase();
        var existing=users.findByEmailIgnoreCase(email);
        if(existing.isPresent() && !existing.get().getId().equals(id))
            throw new ResponseStatusException(HttpStatus.CONFLICT,"Correo ya registrado");
        user.setFullName(req.fullName().trim());
        user.setEmail(email);
        user.setRole(parseRole(req.role()));
        return toDto(users.save(user));
    }
    @GetMapping("/{id}/specialties")
    public java.util.List<TechnicianSpecialtyService.SpecialtyDto> specialties(@PathVariable Long id) {
        return specialties.list(id);
    }
    @PutMapping("/{id}/specialties")
    public java.util.List<TechnicianSpecialtyService.SpecialtyDto> replaceSpecialties(
            @PathVariable Long id, @RequestBody SpecialtyRequest request) {
        return specialties.replace(id, request.categoryIds());
    }
    @PatchMapping("/{id}/active")
    public UserDto setActive(@PathVariable Long id, @RequestBody ActiveRequest request) {
        User user=users.findById(id).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND,"Usuario no encontrado"));
        user.setActive(request.active());
        user=users.save(user);
        return toDto(user);
    }
    private Role parseRole(String value) {
        try { return Role.valueOf(value); } catch(Exception ex) { throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Rol inválido"); }
    }
    private UserDto toDto(User user) {
        return new UserDto(user.getId(),user.getFullName(),user.getEmail(),user.getRole().name(),user.isActive());
    }
    public record CreateUserRequest(String fullName,String email,String password,String role) {}
    public record UpdateUserRequest(String fullName,String email,String role) {}
    public record SpecialtyRequest(java.util.List<Long> categoryIds) {}
    public record ActiveRequest(boolean active) {}
    public record UserDto(Long id,String fullName,String email,String role,boolean active) {}
}
