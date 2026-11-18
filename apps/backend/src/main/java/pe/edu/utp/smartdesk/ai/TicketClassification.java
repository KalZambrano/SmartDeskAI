package pe.edu.utp.smartdesk.ai;
import pe.edu.utp.smartdesk.ticket.TicketPriority;
public record TicketClassification(String categoryCode, TicketPriority priority, String summary, String suggestedResponse, String reason, String source) {}
