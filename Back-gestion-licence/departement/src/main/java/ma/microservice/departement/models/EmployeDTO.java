package ma.microservice.departement.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor @NoArgsConstructor
public class EmployeDTO {
    private Long id;
    private String nom;
    private String prenom;
    private String profil;
    private String email;
    private Long departementId;

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
