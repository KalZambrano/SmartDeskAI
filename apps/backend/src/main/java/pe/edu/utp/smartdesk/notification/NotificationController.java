package pe.edu.utp.smartdesk.notification;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import pe.edu.utp.smartdesk.user.User;
import pe.edu.utp.smartdesk.user.UserRepository;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {
    private final NotificationService notifications;
    private final UserRepository users;

    public NotificationController(NotificationService notifications, UserRepository users) {
        this.notifications = notifications;
        this.users = users;
    }

    @GetMapping
    public List<NotificationService.NotificationDto> list(Authentication auth) {
        return notifications.list(actor(auth));
    }

    @GetMapping("/unread-count")
    public UnreadCount unreadCount(Authentication auth) {
        return new UnreadCount(notifications.unreadCount(actor(auth)));
    }

    @PatchMapping("/{id}/read")
    public NotificationService.NotificationDto markRead(@PathVariable Long id, Authentication auth) {
        return notifications.markRead(id, actor(auth));
    }

    private User actor(Authentication authentication) {
        return users.findByEmailIgnoreCase(authentication.getName()).filter(User::isActive)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
    }

    public record UnreadCount(long count) {}
}
