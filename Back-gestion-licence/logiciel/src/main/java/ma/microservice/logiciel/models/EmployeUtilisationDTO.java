package ma.microservice.logiciel.models;

public class EmployeUtilisationDTO {
    private String nomEmploye;
    private String dateAffectation;
    private String dateDemande;

    public EmployeUtilisationDTO(String nomEmploye, String dateAffectation, String dateDemande) {
        this.nomEmploye = nomEmploye;
        this.dateAffectation = dateAffectation;
        this.dateDemande = dateDemande;
    }

    public String getNomEmploye() {
        return nomEmploye;
    }

    public void setNomEmploye(String nomEmploye) {
        this.nomEmploye = nomEmploye;
    }

    public String getDateAffectation() {
        return dateAffectation;
    }

    public void setDateAffectation(String dateAffectation) {
        this.dateAffectation = dateAffectation;
    }

    public String getDateDemande() {
        return dateDemande;
    }

    public void setDateDemande(String dateDemande) {
        this.dateDemande = dateDemande;
    }
}
