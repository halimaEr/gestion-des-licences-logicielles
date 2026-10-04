package ma.microservice.logiciel.models;

public class CoutsLogicielDTO {
    private String nomLogiciel;
    private Double coutTotal;
    private Double coutConsomme;

    public CoutsLogicielDTO(String nomLogiciel, Double coutTotal, Double coutConsomme) {
        this.nomLogiciel = nomLogiciel;
        this.coutTotal = coutTotal;
        this.coutConsomme = coutConsomme;
    }

    public String getNomLogiciel() {
        return nomLogiciel;
    }

    public void setNomLogiciel(String nomLogiciel) {
        this.nomLogiciel = nomLogiciel;
    }

    public Double getCoutTotal() {
        return coutTotal;
    }

    public void setCoutTotal(Double coutTotal) {
        this.coutTotal = coutTotal;
    }

    public Double getCoutConsomme() {
        return coutConsomme;
    }

    public void setCoutConsomme(Double coutConsomme) {
        this.coutConsomme = coutConsomme;
    }
}
