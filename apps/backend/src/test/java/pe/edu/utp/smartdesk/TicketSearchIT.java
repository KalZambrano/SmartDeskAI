package pe.edu.utp.smartdesk;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;

import pe.edu.utp.smartdesk.ticket.Ticket;
import pe.edu.utp.smartdesk.ticket.TicketPriority;
import pe.edu.utp.smartdesk.ticket.TicketRepository;
import pe.edu.utp.smartdesk.user.Role;
import pe.edu.utp.smartdesk.user.User;
import pe.edu.utp.smartdesk.user.UserRepository;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
@Import(PostgresTestConfiguration.class)
class TicketSearchIT {

    @Autowired
    private TicketRepository tickets;

    @Autowired
    private UserRepository users;

    @Test
    void filtersAndRoleScopeAreAppliedInDatabase() {
        User requester = users.save(new User("Solicitante", "req@test.local", "hash", Role.REQUESTER));
        User other = users.save(new User("Otro", "other@test.local", "hash", Role.REQUESTER));
        Instant due = Instant.now().plus(1, ChronoUnit.DAYS);
        tickets.save(new Ticket("SD-900001", "Router wifi", "desc", TicketPriority.HIGH, requester, due));
        tickets.save(new Ticket("SD-900002", "Impresora", "desc", TicketPriority.LOW, other, due));

        assertThat(tickets.search(requester.getId(), null, null, null, null, null))
                .extracting(Ticket::getTicketCode)
                .containsExactly("SD-900001");
        assertThat(tickets.search(null, null, null, TicketPriority.HIGH, null, "ROUTER"))
                .extracting(Ticket::getTicketCode)
                .containsExactly("SD-900001");
        assertThat(tickets.search(null, null, null, null, null, null))
                .extracting(Ticket::getTicketCode)
                .containsExactlyInAnyOrder("SD-900001", "SD-900002");
    }

    @Test
    void pagedSearchReturnsRequestedSliceAndTotals() {
        User requester = users.save(new User("Paginado", "page@test.local", "hash", Role.REQUESTER));
        Instant due = Instant.now().plus(1, ChronoUnit.DAYS);
        for (int i = 1; i <= 3; i++) {
            tickets.save(new Ticket("SD-91000" + i, "PAGEIT tarea " + i, "desc",
                    TicketPriority.LOW, requester, due));
        }

        Page<Ticket> page = tickets.search(null, null, null, null, null, "PAGEIT",
                PageRequest.of(1, 2));

        assertThat(page.getTotalElements()).isEqualTo(3);
        assertThat(page.getTotalPages()).isEqualTo(2);
        assertThat(page.getContent()).hasSize(1);
        assertThat(page.getNumber()).isEqualTo(1);
    }
}
