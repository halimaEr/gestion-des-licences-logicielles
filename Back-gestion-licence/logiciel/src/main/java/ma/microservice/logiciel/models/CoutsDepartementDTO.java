package ma.microservice.logiciel.models;


public class CoutsDepartementDTO {
    private String departementNom;
    private Double coutTotal;
    private Double coutConsomme;   // licences effectivement utilisées


    public CoutsDepartementDTO(String departementNom, Double coutTotal, Double coutAffectees ) {
        this.departementNom = departementNom;
        this.coutTotal = coutTotal;
        this.coutConsomme=coutAffectees;
    }

    public Double getCoutConsomme() {
        return coutConsomme;
    }

    public void setCoutConsomme(Double coutConsomme) {
        this.coutConsomme = coutConsomme;
    }

    // Getters et Setters
    public String getDepartementNom() { return departementNom; }
    public void setDepartementNom(String departementNom) { this.departementNom = departementNom; }

    public Double getCoutTotal() { return coutTotal; }
    public void setCoutTotal(Double coutTotal) { this.coutTotal = coutTotal; }
}
