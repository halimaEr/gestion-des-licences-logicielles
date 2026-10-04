package org.example.demandeservice.dto;

import java.util.List;
import java.util.Optional;

public class DemandeResponseDTO {
    private Long id;
    private Long logicielId;
    private int nbLicences;
    private String fournisseur;
    private String description;
    private String statut;
    private String nomLogiciel;

    private String versionLogiciel;
    private String categorieLogiciel;
    private String responsable;
    private String departementResponsable;
    private List<EmployeDTO> employes;

    public String getNomLogiciel() {
        return nomLogiciel;
    }

    public void setNomLogiciel(String nomLogiciel) {
        this.nomLogiciel = nomLogiciel;
    }

    public String getVersionLogiciel() {
        return versionLogiciel;
    }

    public void setVersionLogiciel(String versionLogiciel) {
        this.versionLogiciel = versionLogiciel;
    }

    public String getCategorieLogiciel() {
        return categorieLogiciel;
    }

    public void setCategorieLogiciel(String categorieLogiciel) {
        this.categorieLogiciel = categorieLogiciel;
    }

    public Long getLogicielId() {
        return logicielId;
    }

    public void setLogicielId(Long logicielId) {
        this.logicielId = logicielId;
    }

    public String getDepartementResponsable() {
        return departementResponsable;
    }

    public void setDepartementResponsable(String departementResponsable) {
        this.departementResponsable = departementResponsable;
    }


    public List<EmployeDTO> getEmployes() {
        return employes;
    }

    public void setEmployes(List<EmployeDTO> employes) {
        this.employes = employes;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }


    public int getNbLicences() {
        return nbLicences;
    }

    public void setNbLicences(int nbLicences) {
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

    public String getResponsable() {
        return responsable;
    }

    public void setResponsable(String responsable) {
        this.responsable = responsable;
    }
}
