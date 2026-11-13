package pe.edu.utp.smartdesk.user;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {
    private final UserRepository users;
    private final BCryptPasswordEncoder passwords=new BCryptPasswordEncoder();
    public UserController(UserRepository users) { this.users=users; }
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
        Role role;
        try { role=Role.valueOf(req.role()); } catch(Exception ex) { throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Rol inválido"); }
        String email=req.email().trim().toLowerCase();
        if(users.findByEmailIgnoreCase(email).isPresent()) throw new ResponseStatusException(HttpStatus.CONFLICT,"Correo ya registrado");
        User u=users.save(new User(req.fullName().trim(),email,passwords.encode(req.password()),role));
        return new UserDto(u.getId(),u.getFullName(),u.getEmail(),u.getRole().name(),u.isActive());
    }
    public record CreateUserRequest(String fullName,String email,String password,String role) {}
    public record UserDto(Long id,String fullName,String email,String role,boolean active) {}
}
