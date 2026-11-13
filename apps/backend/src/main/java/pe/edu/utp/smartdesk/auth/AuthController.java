package pe.edu.utp.smartdesk.auth;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.utp.smartdesk.user.Role;
import pe.edu.utp.smartdesk.user.User;
import pe.edu.utp.smartdesk.user.UserRepository;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    private final UserRepository users;
    private final TokenService tokens;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
    public AuthController(UserRepository users, TokenService tokens) { this.users=users; this.tokens=tokens; }
    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest req) {
        User u=users.findByEmailIgnoreCase(req.email().trim()).filter(User::isActive)
            .filter(x->encoder.matches(req.password(),x.getPasswordHash()))
            .orElseThrow(()->new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Credenciales inválidas"));
        return new LoginResponse(tokens.issue(u.getEmail(),u.getRole().name()),new UserDto(u.getId(),u.getFullName(),u.getEmail(),u.getRole().name()));
    }
    @PostMapping("/bootstrap")
    @Transactional
    public synchronized UserDto bootstrap(@RequestBody BootstrapRequest req) {
        if (users.count() != 0) throw new ResponseStatusException(HttpStatus.CONFLICT,"La configuración inicial ya fue completada");
        if (req.fullName()==null || req.fullName().isBlank() || req.email()==null || !req.email().contains("@")
                || req.password()==null || req.password().length()<12)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Nombre, correo válido y contraseña de al menos 12 caracteres son obligatorios");
        User u=users.save(new User(req.fullName().trim(),req.email().trim().toLowerCase(),encoder.encode(req.password()),Role.ADMIN));
        return new UserDto(u.getId(),u.getFullName(),u.getEmail(),u.getRole().name());
    }
    @GetMapping("/me")
    public UserDto me(org.springframework.security.core.Authentication auth) {
        User u=users.findByEmailIgnoreCase(auth.getName()).orElseThrow(()->new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        return new UserDto(u.getId(),u.getFullName(),u.getEmail(),u.getRole().name());
    }
    public record LoginRequest(String email,String password) {}
    public record BootstrapRequest(String fullName,String email,String password) {}
    public record UserDto(Long id,String fullName,String email,String role) {}
    public record LoginResponse(String token,UserDto user) {}
}
