package pe.edu.utp.smartdesk.notification;

import java.time.Clock;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import pe.edu.utp.smartdesk.ticket.Ticket;
import pe.edu.utp.smartdesk.user.User;

@Service
public class NotificationService {
    private final NotificationRepository notifications;
    private final Clock clock;

    public NotificationService(NotificationRepository notifications, Clock clock) {
        this.notifications = notifications;
        this.clock = clock;
    }

    @Transactional
    public void notify(User user, Ticket ticket, String title, String message) {
        notifications.save(new Notification(user, ticket, title, message));
    }

    @Transactional
    public void notifyAll(Iterable<User> users, Ticket ticket, String title, String message) {
        for (User user : users) notify(user, ticket, title, message);
    }

    @Transactional(readOnly = true)
    public List<NotificationDto> list(User owner) {
        return notifications.findTop50ByUserIdOrderByCreatedAtDesc(owner.getId()).stream()
                .map(NotificationService::toDto).toList();
    }

    @Transactional(readOnly = true)
    public long unreadCount(User owner) {
        return notifications.countByUserIdAndReadAtIsNull(owner.getId());
    }

    @Transactional
    public NotificationDto markRead(Long notificationId, User owner) {
        Notification notification = notifications.findById(notificationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (!notification.getUser().getId().equals(owner.getId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        notification.markRead(clock.instant());
        return toDto(notification);
    }

    private static NotificationDto toDto(Notification notification) {
        Ticket ticket = notification.getTicket();
        return new NotificationDto(notification.getId(), ticket == null ? null : ticket.getId(),
                ticket == null ? null : ticket.getTicketCode(), notification.getTitle(), notification.getMessage(),
                notification.getReadAt(), notification.getCreatedAt());
    }

    public record NotificationDto(Long id, Long ticketId, String ticketCode, String title, String message,
            java.time.Instant readAt, java.time.Instant createdAt) {}
}
