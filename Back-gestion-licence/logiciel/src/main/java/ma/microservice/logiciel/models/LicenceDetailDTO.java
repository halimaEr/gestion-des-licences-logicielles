package ma.microservice.logiciel.models;

import ma.microservice.logiciel.enumerated.StatutLicence;

import java.time.LocalDate;
import java.util.Date;

public class LicenceDetailDTO {
    private Long licenceId;
    private String logicielNom;
    private String vesrionLogiciel;
    private String categorieLogiciel;
    private String cleLicence;
    private float prix;
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private StatutLicence statut ;
    private String nom;
    private String prenom;

    private String email;

    public String getVesrionLogiciel() {
        return vesrionLogiciel;
    }

    public void setVesrionLogiciel(String vesrionLogiciel) {
        this.vesrionLogiciel = vesrionLogiciel;
    }

    public String getCategorieLogiciel() {
        return categorieLogiciel;
    }

    public void setCategorieLogiciel(String categorieLogiciel) {
        this.categorieLogiciel = categorieLogiciel;
    }

    public Long getLicenceId() {
        return licenceId;
    }

    public void setLicenceId(Long licenceId) {
        this.licenceId = licenceId;
    }

    public String getLogicielNom() {
        return logicielNom;
    }

    public void setLogicielNom(String logicielNom) {
        this.logicielNom = logicielNom;
    }

    public String getCleLicence() {
        return cleLicence;
    }

    public void setCleLicence(String cleLicence) {
        this.cleLicence = cleLicence;
    }

    public float getPrix() {
        return prix;
    }

    public void setPrix(float prix) {
        this.prix = prix;
    }

    public LocalDate getDateDebut() {
        return dateDebut;
    }

    public void setDateDebut(LocalDate dateDebut) {
        this.dateDebut = dateDebut;
    }

    public LocalDate getDateFin() {
        return dateFin;
    }

    public void setDateFin(LocalDate dateFin) {
        this.dateFin = dateFin;
    }

    public StatutLicence getStatut() {
        return statut;
    }

    public void setStatut(StatutLicence statut) {
        this.statut = statut;
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

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
