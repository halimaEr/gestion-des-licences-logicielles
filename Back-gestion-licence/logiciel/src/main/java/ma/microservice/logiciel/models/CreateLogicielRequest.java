package ma.microservice.logiciel.models;

import ma.microservice.logiciel.entities.Logiciel;

public class CreateLogicielRequest {
    private Logiciel logiciel;
    private Long idDemande;



    // Getters et Setters
    public Logiciel getLogiciel() { return logiciel; }
    public void setLogiciel(Logiciel logiciel) { this.logiciel = logiciel; }

    public Long getIdDemande() { return idDemande; }
    public void setIdDemande(Long idDemande) { this.idDemande = idDemande; }
}
