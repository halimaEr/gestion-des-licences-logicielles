package ma.microservice.logiciel.models;

public class DepartementStatsDTO {
    private String departementNom;
    private Long nombreLicences;
    private Double coutTotal;

    public DepartementStatsDTO(String departementNom, Long nombreLicences, Double coutTotal) {
        this.departementNom = departementNom;
        this.nombreLicences = nombreLicences;
        this.coutTotal = coutTotal;
    }

    public String getDepartementNom() {
        return departementNom;
    }

    public void setDepartementNom(String departementNom) {
        this.departementNom = departementNom;
    }

    public Long getNombreLicences() {
        return nombreLicences;
    }

    public void setNombreLicences(Long nombreLicences) {
        this.nombreLicences = nombreLicences;
    }

    public Double getCoutTotal() {
        return coutTotal;
    }

    public void setCoutTotal(Double coutTotal) {
        this.coutTotal = coutTotal;
    }
}
