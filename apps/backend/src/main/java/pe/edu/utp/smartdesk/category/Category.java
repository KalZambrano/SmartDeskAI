package pe.edu.utp.smartdesk.category;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "categories")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 80, unique = true)
    private String name;

    @Column(nullable = false, length = 30, unique = true)
    private String code;

    @Column(length = 255)
    private String description;

    @Column(nullable = false)
    private boolean active = true;

    protected Category() {
    }

    public Category(String name, String code, String description) {
        this.name = name;
        this.code = code;
        this.description = description;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getCode() {
        return code;
    }

    public String getDescription() {
        return description;
    }

    public boolean isActive() {
        return active;
    }

    public void update(String name, String code, String description) {
        this.name = name;
        this.code = code;
        this.description = description;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}
