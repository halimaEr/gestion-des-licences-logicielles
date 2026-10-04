package ma.microservice.logiciel.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.util.List;

public class DemandeDTO {
    private Long id;
    private Long logicielId;
    private Integer nbLicences;
    private LocalDate date;
    private String fournisseur;
    private String description;
    private String statut ;
    private Long responsableId;
    private String nouveauNomLogiciel; // seulement si logicielId == null
    private List<Long> employeIds;

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    // Changez le getter pour correspondre au standard JavaBean


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }


    public Long getLogicielId() {
        return logicielId;
    }

    public void setLogicielId(Long logicielId) {
        this.logicielId = logicielId;
    }

    public Integer getNbLicences() {
        return nbLicences;
    }

    public void setNbLicences(Integer nbLicences) {
        this.nbLicences = nbLicences;
    }

    public String getFournisseur() {
        return fournisseur;
    }

    public void setFournisseur(String fournisseur) {
        this.fournisseur = fournisseur;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStatut() {
        return statut;
    }

    public void setStatut(String statut) {
        this.statut = statut;
    }

    public Long getResponsableId() {
        return responsableId;
    }

    public void setResponsableId(Long responsableId) {
        this.responsableId = responsableId;
    }

    public List<Long> getEmployeIds() {
        return employeIds;
    }

    public void setEmployeIds(List<Long> employeIds) {
        this.employeIds = employeIds;
    }
    public String getNouveauNomLogiciel() { return nouveauNomLogiciel; }
    public void setNouveauNomLogiciel(String nouveauNomLogiciel) { this.nouveauNomLogiciel = nouveauNomLogiciel; }

}
