package ma.microservice.logiciel.models;
// LogicielStatsDTO.java
public class LogicielStatsDTO {
    private String nom;
    private Long nombreLicences;

    // ✅ Ce constructeur DOIT exister, et les types doivent correspondre
    public LogicielStatsDTO(String nom, Long nombreLicences) {
        this.nom = nom;
        this.nombreLicences = nombreLicences;
    }

    // Getters et setters
    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }
    public Long getNombreLicences() { return nombreLicences; }
    public void setNombreLicences(Long nombreLicences) { this.nombreLicences = nombreLicences; }
}