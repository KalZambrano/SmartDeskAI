package pe.edu.utp.smartdesk.user;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.lang.reflect.Field;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import pe.edu.utp.smartdesk.assignment.TechnicianSpecialtyService;

class UserControllerTest {

    private final UserRepository users = mock(UserRepository.class);
    private final UserController controller =
            new UserController(users, mock(TechnicianSpecialtyService.class));

    @Test
    void updateChangesNameEmailAndRole() throws Exception {
        User user = userWithId(7L, "Ana Torres", "ana@example.com", Role.REQUESTER);
        when(users.findById(7L)).thenReturn(Optional.of(user));
        when(users.findByEmailIgnoreCase("nueva@example.com")).thenReturn(Optional.empty());
        when(users.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var result = controller.update(
                7L,
                new UserController.UpdateUserRequest(
                        "  Nueva Torres  ", " NUEVA@Example.com ", "TECHNICIAN"));

        assertThat(result)
                .isEqualTo(
                        new UserController.UserDto(
                                7L, "Nueva Torres", "nueva@example.com", "TECHNICIAN", true));
        assertThat(user.getFullName()).isEqualTo("Nueva Torres");
        assertThat(user.getEmail()).isEqualTo("nueva@example.com");
        assertThat(user.getRole()).isEqualTo(Role.TECHNICIAN);
        verify(users).save(user);
    }

    @Test
    void updateAllowsKeepingOwnEmail() throws Exception {
        User user = userWithId(7L, "Ana Torres", "ana@example.com", Role.REQUESTER);
        when(users.findById(7L)).thenReturn(Optional.of(user));
        when(users.findByEmailIgnoreCase("ana@example.com")).thenReturn(Optional.of(user));
        when(users.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var result =
                controller.update(
                        7L,
                        new UserController.UpdateUserRequest(
                                "Ana Torres", "ANA@example.com", "REQUESTER"));

        assertThat(result.email()).isEqualTo("ana@example.com");
        verify(users).save(user);
    }

    @Test
    void updateRejectsEmailUsedByAnotherUser() throws Exception {
        User user = userWithId(7L, "Ana Torres", "ana@example.com", Role.REQUESTER);
        User other = userWithId(9L, "Luis", "luis@example.com", Role.REQUESTER);
        when(users.findById(7L)).thenReturn(Optional.of(user));
        when(users.findByEmailIgnoreCase("luis@example.com")).thenReturn(Optional.of(other));

        assertThatThrownBy(
                        () ->
                                controller.update(
                                        7L,
                                        new UserController.UpdateUserRequest(
                                                "Ana Torres", "luis@example.com", "REQUESTER")))
                .isInstanceOfSatisfying(
                        ResponseStatusException.class,
                        error -> assertThat(error.getStatusCode()).isEqualTo(HttpStatus.CONFLICT));
        verify(users, never()).save(any(User.class));
        assertThat(user.getEmail()).isEqualTo("ana@example.com");
    }

    @Test
    void updateRejectsInvalidRole() throws Exception {
        User user = userWithId(7L, "Ana Torres", "ana@example.com", Role.REQUESTER);
        when(users.findById(7L)).thenReturn(Optional.of(user));

        assertThatThrownBy(
                        () ->
                                controller.update(
                                        7L,
                                        new UserController.UpdateUserRequest(
                                                "Ana Torres", "ana@example.com", "INSPECTOR")))
                .isInstanceOfSatisfying(
                        ResponseStatusException.class,
                        error ->
                                assertThat(error.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST));
        verify(users, never()).save(any(User.class));
    }

    @Test
    void updateReturnsNotFoundWhenUserIsMissing() {
        when(users.findById(404L)).thenReturn(Optional.empty());

        assertThatThrownBy(
                        () ->
                                controller.update(
                                        404L,
                                        new UserController.UpdateUserRequest(
                                                "Ana", "ana@example.com", "REQUESTER")))
                .isInstanceOfSatisfying(
                        ResponseStatusException.class,
                        error ->
                                assertThat(error.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND));
    }

    @Test
    void updateRejectsBlankNameBeforeTouchingRepository() {
        assertThatThrownBy(
                        () ->
                                controller.update(
                                        7L,
                                        new UserController.UpdateUserRequest(
                                                "  ", "ana@example.com", "REQUESTER")))
                .isInstanceOfSatisfying(
                        ResponseStatusException.class,
                        error ->
                                assertThat(error.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST));
        verify(users, never()).findById(any());
    }

    private static User userWithId(long id, String fullName, String email, Role role)
            throws Exception {
        User user = new User(fullName, email, "hash", role);
        Field field = User.class.getDeclaredField("id");
        field.setAccessible(true);
        field.set(user, id);
        return user;
    }
}
