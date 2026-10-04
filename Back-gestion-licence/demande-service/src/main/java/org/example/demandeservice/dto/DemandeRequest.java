package org.example.demandeservice.dto;

import org.example.demandeservice.model.Demande;

public class DemandeRequest {
    private Demande demande;
    private String gestionnaireEmail;

    public Demande getDemande() {
        return demande;
    }

    public void setDemande(Demande demande) {
        this.demande = demande;
    }

    public String getGestionnaireEmail() {
        return gestionnaireEmail;
    }

    public void setGestionnaireEmail(String gestionnaireEmail) {
        this.gestionnaireEmail = gestionnaireEmail;
    }
}
