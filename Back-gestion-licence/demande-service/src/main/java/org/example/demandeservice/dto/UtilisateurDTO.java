package org.example.demandeservice.dto;

public class UtilisateurDTO {
    private Long id;
    private String username;
    private String nom;
    private String prenom;

    public UtilisateurDTO(Long id, String username, String nom, String prenom) {
        this.id = id;
        this.username = username;
        this.nom = nom;
        this.prenom = prenom;
    }

    public UtilisateurDTO() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getPrenom() {
        return prenom;
    }

    public void setPrenom(String prenom) {
        this.prenom = prenom;
    }
}
