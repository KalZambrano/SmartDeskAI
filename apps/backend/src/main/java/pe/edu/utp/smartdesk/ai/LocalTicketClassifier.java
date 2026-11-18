package pe.edu.utp.smartdesk.ai;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
import org.springframework.stereotype.Component;
import pe.edu.utp.smartdesk.category.Category;
import pe.edu.utp.smartdesk.ticket.TicketPriority;

@Component
public class LocalTicketClassifier {
    public TicketClassification classify(String title, String description, List<Category> categories) {
        String text = normalize(title + " " + description);
        String code = chooseCategory(text, categories);
        TicketPriority priority = text.matches(".*\\b(urgente|critico|critica|caido|caida|bloqueado|bloqueada|no funciona nada)\\b.*")
                ? TicketPriority.CRITICAL
                : text.matches(".*\\b(error|falla|fallo|no funciona|intermitente|perdida)\\b.*")
                    ? TicketPriority.HIGH : TicketPriority.MEDIUM;
        String summary = (title.trim() + ". " + description.trim()).replaceAll("\\s+", " ");
        if (summary.length() > 500) summary = summary.substring(0, 497).stripTrailing() + "...";
        return new TicketClassification(code, priority, summary,
                "Gracias por reportar esta incidencia. El equipo de soporte revisará la información y continuará la atención por este ticket.",
                "Gemini no está configurado o no pudo responder; sugerencia local basada en palabras clave. Revisa categoría y prioridad antes de atender.",
                "RULES");
    }
    private String chooseCategory(String text, List<Category> categories) {
        String wanted = text.matches(".*\\b(wifi|internet|red|conexion|vpn)\\b.*") ? "NETWORK"
                : text.matches(".*\\b(contrasena|password|cuenta|acceso|permiso|usuario)\\b.*") ? "ACCESS"
                : text.matches(".*\\b(servidor|base de datos|database|infraestructura|servicio interno)\\b.*") ? "INFRASTRUCTURE"
                : text.matches(".*\\b(impresora|laptop|teclado|mouse|monitor|equipo|hardware)\\b.*") ? "HARDWARE"
                : text.matches(".*\\b(software|aplicacion|aplicativo|sistema|licencia|instalar|programa)\\b.*") ? "SOFTWARE" : "OTHER";
        return categories.stream().filter(c -> c.getCode().equalsIgnoreCase(wanted)).map(Category::getCode).findFirst()
                .or(() -> categories.stream().filter(c -> c.getCode().equalsIgnoreCase("OTHER")).map(Category::getCode).findFirst())
                .or(() -> categories.stream().findFirst().map(Category::getCode)).orElse(null);
    }
    private String normalize(String value) {
        return Normalizer.normalize(value, Normalizer.Form.NFD).replaceAll("\\p{M}", "").toLowerCase(Locale.ROOT);
    }
}
