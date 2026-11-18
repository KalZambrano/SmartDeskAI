package pe.edu.utp.smartdesk.ticket;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.server.ResponseStatusException;

import pe.edu.utp.smartdesk.ai.TicketClassificationService;
import pe.edu.utp.smartdesk.comment.TicketCommentRepository;
import pe.edu.utp.smartdesk.user.Role;
import pe.edu.utp.smartdesk.user.User;
import pe.edu.utp.smartdesk.user.UserRepository;

class TicketControllerFilterTest {

    private final TicketRepository tickets = mock(TicketRepository.class);
    private final TicketHistoryRepository history = mock(TicketHistoryRepository.class);
    private final TicketCommentRepository comments = mock(TicketCommentRepository.class);
    private final UserRepository users = mock(UserRepository.class);
    private final pe.edu.utp.smartdesk.category.CategoryRepository categories =
            mock(pe.edu.utp.smartdesk.category.CategoryRepository.class);
    private final TicketClassificationService classifier = mock(TicketClassificationService.class);

    @Test
    void requesterIsScopedAndFiltersReachRepository() {
        Authentication auth = authFor(Role.REQUESTER);
        when(tickets.search(7L, null, TicketStatus.OPEN, TicketPriority.HIGH, 3L, "wifi"))
                .thenReturn(List.of());

        assertThat(controller().list(auth, TicketStatus.OPEN, TicketPriority.HIGH, 3L, "  wifi  "))
                .isEmpty();

        verify(tickets).search(7L, null, TicketStatus.OPEN, TicketPriority.HIGH, 3L, "wifi");
    }

    @Test
    void technicianIsScopedAndAdminIsNot() {
        controller().list(authFor(Role.TECHNICIAN), null, null, null, null);
        verify(tickets).search(null, 7L, null, null, null, null);

        controller().list(authFor(Role.ADMIN), null, null, null, null);
        verify(tickets).search(null, null, null, null, null, null);
    }

    @Test
    void tooLongSearchIsRejected() {
        assertThatThrownBy(() -> controller().list(authFor(Role.ADMIN), null, null, null, "x".repeat(101)))
                .isInstanceOfSatisfying(ResponseStatusException.class,
                        e -> assertThat(e.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST));
    }

    private TicketController controller() {
        return new TicketController(tickets, history, comments, users, categories, classifier);
    }

    private Authentication authFor(Role role) {
        User user = mock(User.class);
        when(user.getId()).thenReturn(7L);
        when(user.getRole()).thenReturn(role);
        when(user.isActive()).thenReturn(true);
        when(users.findByEmailIgnoreCase("user@test.local")).thenReturn(Optional.of(user));
        Authentication auth = mock(Authentication.class);
        when(auth.getName()).thenReturn("user@test.local");
        return auth;
    }
}
