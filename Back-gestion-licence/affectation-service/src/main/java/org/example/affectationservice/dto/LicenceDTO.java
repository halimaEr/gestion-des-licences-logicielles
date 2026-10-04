package org.example.affectationservice.dto;

import java.util.Date;

public class LicenceDTO {
    private Long id;
    private String cleLicence;
    private float prix;
    private LogicielDTO logiciel;


    public LogicielDTO getLogiciel() {
        return logiciel;
    }

    public void setLogiciel(LogicielDTO logiciel) {
        this.logiciel = logiciel;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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


}
