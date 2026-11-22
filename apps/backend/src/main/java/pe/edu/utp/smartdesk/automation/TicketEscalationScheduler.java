package pe.edu.utp.smartdesk.automation;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class TicketEscalationScheduler {
    private final TicketAutomationService automation;

    public TicketEscalationScheduler(TicketAutomationService automation) {
        this.automation = automation;
    }

    @Scheduled(fixedDelayString = "${smartdesk.automation.escalation-interval-ms:60000}")
    public void escalateOverdueTickets() {
        automation.escalateOverdueTickets();
    }
}
