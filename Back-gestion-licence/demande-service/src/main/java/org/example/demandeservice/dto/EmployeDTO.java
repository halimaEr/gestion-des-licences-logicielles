package org.example.demandeservice.dto;

public class EmployeDTO {
    private Long id;
    private String nom;
    private String email;
    private String prenom;
    private String profil;

    public EmployeDTO(Long id, String nom, String email, String prenom, String profil) {
        this.id = id;
        this.nom = nom;
        this.email = email;
        this.prenom = prenom;
        this.profil = profil;
    }

    public EmployeDTO() {
    }

    public String getProfil() {
        return profil;
    }

    public void setProfil(String profil) {
        this.profil = profil;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPrenom() {
        return prenom;
    }

    public void setPrenom(String prenom) {
        this.prenom = prenom;
    }
}
