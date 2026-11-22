package pe.edu.utp.smartdesk.assignment;

import jakarta.persistence.*;
import pe.edu.utp.smartdesk.category.Category;
import pe.edu.utp.smartdesk.user.User;

@Entity
@Table(name = "technician_specialties", uniqueConstraints = @UniqueConstraint(columnNames = {"technician_id", "category_id"}))
public class TechnicianSpecialty {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(optional = false) @JoinColumn(name = "technician_id", nullable = false)
    private User technician;
    @ManyToOne(optional = false) @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    protected TechnicianSpecialty() {}

    public TechnicianSpecialty(User technician, Category category) {
        this.technician = technician;
        this.category = category;
    }

    public Category getCategory() { return category; }
}
