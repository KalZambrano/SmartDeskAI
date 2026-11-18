package pe.edu.utp.smartdesk.ai;
import java.util.List;
import java.util.Optional;
import pe.edu.utp.smartdesk.category.Category;
public interface TicketClassifier {
    Optional<TicketClassification> classify(String title, String description, List<Category> categories);
}
