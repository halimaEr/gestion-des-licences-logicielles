package ma.microservice.logiciel.models;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class DemandeRenouvellementResponse {
    private Long id;
    private Long licenceId;
    private String logicielNom;
    private String cleLicence;
    private LocalDate dateFinActuelle;
    private LocalDate nouvelleDateFin;
    private String employeConcerneNom; // ← Employé qui utilise la licence
    private String demandeurNom;
    private String demandeurDepartement; // ← Département du demandeur
    private LocalDateTime dateCreation;
    private String statut;

    public DemandeRenouvellementResponse(Long id, Long licenceId, String logicielNom, String cleLicence, LocalDate dateFinActuelle, LocalDate nouvelleDateFin, String employeConcerneNom, String demandeurNom, String demandeurDepartement, LocalDateTime dateCreation, String statut) {
        this.id = id;
        this.licenceId = licenceId;
        this.logicielNom = logicielNom;
        this.cleLicence = cleLicence;
        this.dateFinActuelle = dateFinActuelle;
        this.nouvelleDateFin = nouvelleDateFin;
        this.employeConcerneNom = employeConcerneNom;
        this.demandeurNom = demandeurNom;
        this.demandeurDepartement = demandeurDepartement;
        this.dateCreation = dateCreation;
        this.statut = statut;
    }

    public DemandeRenouvellementResponse() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public LocalDate getDateFinActuelle() {
        return dateFinActuelle;
    }

    public void setDateFinActuelle(LocalDate dateFinActuelle) {
        this.dateFinActuelle = dateFinActuelle;
    }

    public LocalDate getNouvelleDateFin() {
        return nouvelleDateFin;
    }

    public void setNouvelleDateFin(LocalDate nouvelleDateFin) {
        this.nouvelleDateFin = nouvelleDateFin;
    }

    public String getEmployeConcerneNom() {
        return employeConcerneNom;
    }

    public void setEmployeConcerneNom(String employeConcerneNom) {
        this.employeConcerneNom = employeConcerneNom;
    }

    public String getDemandeurNom() {
        return demandeurNom;
    }

    public void setDemandeurNom(String demandeurNom) {
        this.demandeurNom = demandeurNom;
    }

    public String getDemandeurDepartement() {
        return demandeurDepartement;
    }

    public void setDemandeurDepartement(String demandeurDepartement) {
        this.demandeurDepartement = demandeurDepartement;
    }

    public LocalDateTime getDateCreation() {
        return dateCreation;
    }

    public void setDateCreation(LocalDateTime dateCreation) {
        this.dateCreation = dateCreation;
    }

    public String getStatut() {
        return statut;
    }

    public void setStatut(String statut) {
        this.statut = statut;
    }
}
