package pe.edu.utp.smartdesk.ticket;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.server.ResponseStatusException;

import pe.edu.utp.smartdesk.ai.TicketClassificationService;
import pe.edu.utp.smartdesk.assignment.TicketAssignmentService;
import pe.edu.utp.smartdesk.comment.TicketCommentRepository;
import pe.edu.utp.smartdesk.notification.NotificationService;
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
    private final TicketAssignmentService assignment = mock(TicketAssignmentService.class);
    private final NotificationService notifications = mock(NotificationService.class);

    @Test
    void requesterIsScopedAndFiltersReachRepository() {
        Authentication auth = authFor(Role.REQUESTER);
        PageRequest pageable = PageRequest.of(0, 20);
        when(tickets.search(7L, null, TicketStatus.OPEN, TicketPriority.HIGH, 3L, "wifi", pageable))
                .thenReturn(new PageImpl<>(List.of(), pageable, 0));

        assertThat(controller().list(auth, TicketStatus.OPEN, TicketPriority.HIGH, 3L, "  wifi  ", 0, 20)
                .content()).isEmpty();

        verify(tickets).search(7L, null, TicketStatus.OPEN, TicketPriority.HIGH, 3L, "wifi", pageable);
    }

    @Test
    void technicianIsScopedAndAdminIsNot() {
        PageRequest pageable = PageRequest.of(0, 20);
        when(tickets.search(null, 7L, null, null, null, null, pageable))
                .thenReturn(new PageImpl<>(List.of(), pageable, 0));
        when(tickets.search(null, null, null, null, null, null, pageable))
                .thenReturn(new PageImpl<>(List.of(), pageable, 0));

        controller().list(authFor(Role.TECHNICIAN), null, null, null, null, 0, 20);
        verify(tickets).search(null, 7L, null, null, null, null, pageable);

        controller().list(authFor(Role.ADMIN), null, null, null, null, 0, 20);
        verify(tickets).search(null, null, null, null, null, null, pageable);
    }

    @Test
    void pageMetadataIsReturned() {
        PageRequest pageable = PageRequest.of(2, 20);
        when(tickets.search(null, null, null, null, null, null, pageable))
                .thenReturn(new PageImpl<>(List.of(), pageable, 100));

        var response = controller().list(authFor(Role.ADMIN), null, null, null, null, 2, 20);

        assertThat(response.page()).isEqualTo(2);
        assertThat(response.size()).isEqualTo(20);
        assertThat(response.totalElements()).isEqualTo(100);
        assertThat(response.totalPages()).isEqualTo(5);
        assertThat(response.first()).isFalse();
        assertThat(response.last()).isFalse();
    }

    @Test
    void tooLongSearchIsRejected() {
        assertThatThrownBy(() -> controller().list(authFor(Role.ADMIN), null, null, null, "x".repeat(101), 0, 20))
                .isInstanceOfSatisfying(ResponseStatusException.class,
                        e -> assertThat(e.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST));
    }

    @Test
    void invalidPaginationIsRejected() {
        assertThatThrownBy(() -> controller().list(authFor(Role.ADMIN), null, null, null, null, -1, 20))
                .isInstanceOfSatisfying(ResponseStatusException.class,
                        e -> assertThat(e.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST));
        assertThatThrownBy(() -> controller().list(authFor(Role.ADMIN), null, null, null, null, 0, 101))
                .isInstanceOfSatisfying(ResponseStatusException.class,
                        e -> assertThat(e.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST));
    }

    @Test
    void requesterCannotReadAnotherRequestersTicket() {
        User other = userWithId(8L, Role.REQUESTER);
        Ticket ticket = mock(Ticket.class);
        when(ticket.getRequester()).thenReturn(other);
        when(tickets.findById(11L)).thenReturn(Optional.of(ticket));

        assertThatThrownBy(() -> controller().get(11L, authFor(Role.REQUESTER)))
                .isInstanceOfSatisfying(ResponseStatusException.class,
                        e -> assertThat(e.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN));
    }

    @Test
    void technicianCannotReadUnassignedTicket() {
        when(tickets.findById(12L)).thenReturn(Optional.of(mock(Ticket.class)));

        assertThatThrownBy(() -> controller().get(12L, authFor(Role.TECHNICIAN)))
                .isInstanceOfSatisfying(ResponseStatusException.class,
                        e -> assertThat(e.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN));
    }

    @Test
    void assignedTechnicianCanReadTicket() {
        User requester = userWithId(8L, Role.REQUESTER);
        User technician = userWithId(7L, Role.TECHNICIAN);
        Ticket ticket = mock(Ticket.class);
        when(ticket.getRequester()).thenReturn(requester);
        when(ticket.getAssignedTechnician()).thenReturn(technician);
        when(ticket.getPriority()).thenReturn(TicketPriority.MEDIUM);
        when(ticket.getStatus()).thenReturn(TicketStatus.OPEN);
        when(tickets.findById(13L)).thenReturn(Optional.of(ticket));

        assertThat(controller().get(13L, authFor(Role.TECHNICIAN))).isNotNull();
    }

    private User userWithId(long id, Role role) {
        User user = mock(User.class);
        when(user.getId()).thenReturn(id);
        when(user.getRole()).thenReturn(role);
        return user;
    }

    private TicketController controller() {
        return new TicketController(tickets, history, comments, users, categories, classifier,
                assignment, notifications);
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
