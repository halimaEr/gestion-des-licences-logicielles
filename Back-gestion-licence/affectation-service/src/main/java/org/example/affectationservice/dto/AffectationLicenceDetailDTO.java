package org.example.affectationservice.dto;


import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

public class AffectationLicenceDetailDTO {
    private LocalDate dateAffectation;
    private Long licenceId;
    private String cleLicence;
    private String nomLogiciel;

    // Constructeur
    public AffectationLicenceDetailDTO(LocalDate dateAffectation, Long licenceId, String cleLicence, String nomLogiciel) {
        this.dateAffectation = dateAffectation;
        this.licenceId = licenceId;
        this.cleLicence = cleLicence;
        this.nomLogiciel=nomLogiciel;
    }

    public String getNomLogiciel() {
        return nomLogiciel;
    }

    public void setNomLogiciel(String nomLogiciel) {
        this.nomLogiciel = nomLogiciel;
    }

    // Getters et Setters
    public LocalDate getDateAffectation() {
        return dateAffectation;
    }

    public void setDateAffectation(LocalDate dateAffectation) {
        this.dateAffectation = dateAffectation;
    }

    public Long getLicenceId() {
        return licenceId;
    }

    public void setLicenceId(Long licenceId) {
        this.licenceId = licenceId;
    }

    public String getCleLicence() {
        return cleLicence;
    }

    public void setCleLicence(String cleLicence) {
        this.cleLicence = cleLicence;
    }
}