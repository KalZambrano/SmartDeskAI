package pe.edu.utp.smartdesk.ai;
import java.util.List;
import org.springframework.stereotype.Service;
import pe.edu.utp.smartdesk.category.Category;
@Service
public class TicketClassificationService {
    private final TicketClassifier gemini;
    private final LocalTicketClassifier local;
    public TicketClassificationService(TicketClassifier gemini, LocalTicketClassifier local) {
        this.gemini = gemini;
        this.local = local;
    }
    public TicketClassification classify(String title, String description, List<Category> categories) {
        return gemini.classify(title, description, categories).orElseGet(() -> local.classify(title, description, categories));
    }
}
