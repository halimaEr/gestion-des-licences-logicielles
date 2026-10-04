package org.example.demandeservice.dto;

public class LogicielDTO {
    private Long id;
    private String nom;
    private String version;
    private String categorie;
    private Integer nombreLicencesMax;


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

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public String getCategorie() {
        return categorie;
    }

    public void setCategorie(String categorie) {
        this.categorie = categorie;
    }
    public Integer getNombreLicencesMax() {
        return nombreLicencesMax;
    }

    public void setNombreLicencesMax(Integer nombreLicencesMax) {
        this.nombreLicencesMax = nombreLicencesMax;
    }
}
