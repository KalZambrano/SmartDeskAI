package pe.edu.utp.smartdesk.ticket;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import pe.edu.utp.smartdesk.comment.TicketComment;
import pe.edu.utp.smartdesk.comment.TicketCommentRepository;
import pe.edu.utp.smartdesk.user.*;

@RestController
@RequestMapping("/api/v1/tickets")
public class TicketController {
    private final TicketRepository tickets;
    private final TicketHistoryRepository history;
    private final TicketCommentRepository comments;
    private final UserRepository users;
    private final pe.edu.utp.smartdesk.category.CategoryRepository categories;
    public TicketController(TicketRepository tickets, TicketHistoryRepository history, TicketCommentRepository comments,
            UserRepository users, pe.edu.utp.smartdesk.category.CategoryRepository categories) {
        this.tickets=tickets; this.history=history; this.comments=comments; this.users=users; this.categories=categories;
    }
    @GetMapping
    public List<TicketDto> list(Authentication auth) {
        User u=actor(auth);
        List<Ticket> rows=switch(u.getRole()) {
            case ADMIN -> tickets.findAllByOrderByCreatedAtDesc();
            case TECHNICIAN -> tickets.findByAssignedTechnicianIdOrderByCreatedAtDesc(u.getId());
            case REQUESTER -> tickets.findByRequesterIdOrderByCreatedAtDesc(u.getId());
        };
        return rows.stream().map(this::dto).toList();
    }
    @PostMapping
    @Transactional
    public TicketDto create(@RequestBody CreateRequest req, Authentication auth) {
        User u=actor(auth);
        if(u.getRole()!=Role.REQUESTER && u.getRole()!=Role.ADMIN) throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        if(req.title()==null || req.title().isBlank() || req.title().length()>150 || req.description()==null || req.description().isBlank() || req.description().length()>4000)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Título y descripción requeridos");
        TicketPriority priority=req.priority()==null?TicketPriority.MEDIUM:req.priority();
        Instant now=Instant.now();
        Ticket t=tickets.save(new Ticket("SD-"+String.format("%06d", System.currentTimeMillis()%1000000),req.title().trim(),req.description().trim(),priority,u,
            now.plus(switch(priority){case LOW->24;case MEDIUM->12;case HIGH->4;case CRITICAL->1;},ChronoUnit.HOURS)));
        if(req.categoryId()!=null) t.setCategory(categories.findById(req.categoryId()).orElseThrow(()->new ResponseStatusException(HttpStatus.BAD_REQUEST,"Categoría no válida")));
        history.save(new TicketHistory(t,u,"CREATED",null,t.getStatus().name(),"Incidencia registrada"));
        return dto(tickets.save(t));
    }
    @GetMapping("/{id}")
    public TicketDto get(@PathVariable Long id, Authentication auth) { return dto(allowed(id,actor(auth))); }
    @PutMapping("/{id}")
    @Transactional
    public TicketDto update(@PathVariable Long id,@RequestBody UpdateRequest req,Authentication auth) {
        User user=actor(auth); Ticket t=allowed(id,user);
        if(user.getRole()!=Role.ADMIN && user.getRole()!=Role.REQUESTER)
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        if(user.getRole()==Role.REQUESTER && !t.getRequester().getId().equals(user.getId()))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        if(t.getStatus()==TicketStatus.CLOSED) throw new ResponseStatusException(HttpStatus.CONFLICT,"Una incidencia cerrada no se puede editar");
        if(req.title()==null || req.title().isBlank() || req.title().length()>150 || req.description()==null || req.description().isBlank() || req.description().length()>4000)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Título y descripción requeridos");
        TicketPriority priority=req.priority()==null?t.getPriority():req.priority();
        t.update(req.title().trim(),req.description().trim(),priority);
        history.save(new TicketHistory(t,user,"UPDATED",null,null,"Se actualizaron los datos de la incidencia"));
        return dto(tickets.save(t));
    }
    @PatchMapping("/{id}/status")
    @Transactional
    public TicketDto status(@PathVariable Long id,@RequestBody StatusRequest req,Authentication auth) {
        User user=actor(auth); Ticket t=allowed(id,user);
        if(user.getRole()==Role.REQUESTER || (user.getRole()==Role.TECHNICIAN && !t.getAssignedTechnician().getId().equals(user.getId())))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        TicketStatus next;
        try { next=TicketStatus.valueOf(req.status()); } catch(Exception ex) { throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Estado inválido"); }
        if(t.getStatus()==TicketStatus.CLOSED || (t.getStatus()==TicketStatus.RESOLVED && next!=TicketStatus.CLOSED) || next==TicketStatus.OPEN)
            throw new ResponseStatusException(HttpStatus.CONFLICT,"Transición de estado no permitida");
        String previous=t.getStatus().name(); t.setStatus(next); tickets.save(t);
        history.save(new TicketHistory(t,user,"STATUS_CHANGED",previous,next.name(),"Estado actualizado"));
        return dto(t);
    }
    @PatchMapping("/{id}/assignment")
    @Transactional
    public TicketDto assign(@PathVariable Long id,@RequestBody AssignmentRequest req,Authentication auth) {
        User admin=actor(auth);
        if(admin.getRole()!=Role.ADMIN) throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        Ticket t=tickets.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND));
        User technician=users.findById(req.technicianId()).filter(User::isActive)
                .filter(u->u.getRole()==Role.TECHNICIAN)
                .orElseThrow(()->new ResponseStatusException(HttpStatus.BAD_REQUEST,"Técnico activo no encontrado"));
        String old=t.getAssignedTechnician()==null?null:t.getAssignedTechnician().getEmail();
        t.assign(technician); tickets.save(t);
        history.save(new TicketHistory(t,admin,"ASSIGNED",old,technician.getEmail(),"Incidencia asignada"));
        return dto(t);
    }
    @GetMapping("/{id}/comments")
    public List<CommentDto> comments(@PathVariable Long id,Authentication auth) {
        allowed(id,actor(auth));
        return comments.findByTicketIdOrderByCreatedAtAsc(id).stream().map(c->new CommentDto(c.getId(),c.getAuthor().getFullName(),c.getContent(),c.getCreatedAt())).toList();
    }
    @PostMapping("/{id}/comments")
    @Transactional
    public CommentDto addComment(@PathVariable Long id,@RequestBody CommentRequest req,Authentication auth) {
        User user=actor(auth); Ticket ticket=allowed(id,user);
        if(req.content()==null || req.content().isBlank() || req.content().length()>2000) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Comentario requerido (máximo 2000 caracteres)");
        TicketComment c=comments.save(new TicketComment(ticket,user,req.content().trim()));
        history.save(new TicketHistory(ticket,user,"COMMENT_ADDED",null,null,"Se agregó un comentario"));
        return new CommentDto(c.getId(),user.getFullName(),c.getContent(),c.getCreatedAt());
    }
    @GetMapping("/{id}/history")
    public List<HistoryDto> history(@PathVariable Long id,Authentication auth) {
        allowed(id,actor(auth));
        return history.findByTicketIdOrderByCreatedAtAsc(id).stream().map(h->new HistoryDto(h.getId(),h.getEventType(),h.getDescription(),h.getCreatedAt())).toList();
    }
    private User actor(Authentication a) { return users.findByEmailIgnoreCase(a.getName()).filter(User::isActive).orElseThrow(()->new ResponseStatusException(HttpStatus.UNAUTHORIZED)); }
    private Ticket allowed(Long id,User u) {
        Ticket t=tickets.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND));
        boolean ok=u.getRole()==Role.ADMIN || (u.getRole()==Role.REQUESTER && t.getRequester().getId().equals(u.getId()))
                || (u.getRole()==Role.TECHNICIAN && t.getAssignedTechnician()!=null && t.getAssignedTechnician().getId().equals(u.getId()));
        if(!ok) throw new ResponseStatusException(HttpStatus.FORBIDDEN); return t;
    }
    private TicketDto dto(Ticket t) { return new TicketDto(t.getId(),t.getTicketCode(),t.getTitle(),t.getDescription(),t.getCategory()==null?null:t.getCategory().getName(),t.getPriority().name(),t.getStatus().name(),t.getRequester().getFullName(),t.getAssignedTechnician()==null?null:t.getAssignedTechnician().getFullName(),t.getCreatedAt(),t.getDueAt()); }
    public record CreateRequest(String title,String description,TicketPriority priority,Long categoryId) {}
    public record UpdateRequest(String title,String description,TicketPriority priority) {}
    public record StatusRequest(String status) {}
    public record AssignmentRequest(Long technicianId) {}
    public record CommentRequest(String content) {}
    public record TicketDto(Long id,String ticketCode,String title,String description,String categoryName,String priority,String status,String requesterName,String assignedTechnicianName,Instant createdAt,Instant dueAt) {}
    public record CommentDto(Long id,String authorName,String content,Instant createdAt) {}
    public record HistoryDto(Long id,String eventType,String description,Instant createdAt) {}
}
