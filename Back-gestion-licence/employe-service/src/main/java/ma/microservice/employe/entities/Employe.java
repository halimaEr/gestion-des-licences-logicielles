package ma.microservice.employe.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Value;


@Entity
@Data
public class Employe {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nom;
    private String prenom;
    private String profil;
    @Column(unique = true)
    private String email;
    private Long departementId;

    public Employe() {
    }


    public Employe(Long id, String nom, String prenom, String profil, String email, Long departementId) {
        this.id = id;
        this.nom = nom;
        this.prenom = prenom;
        this.profil = profil;
        this.email = email;
        this.departementId = departementId;
    }

    public Long getId() {
        return id;
    }

    public String getNom() {
        return nom;
    }

    public String getPrenom() {
        return prenom;
    }

    public String getProfil() {
        return profil;
    }

    public String getEmail() {
        return email;
    }

    public Long getDepartementId() {
        return departementId;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public void setPrenom(String prenom) {
        this.prenom = prenom;
    }

    public void setProfil(String profil) {
        this.profil = profil;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setDepartementId(Long departementId) {
        this.departementId = departementId;
    }
}
