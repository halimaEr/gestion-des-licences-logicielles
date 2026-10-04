package ma.microservice.logiciel.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
@Entity
public class DemandeRenouvellement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "licence_id", nullable = false)
    @JsonIgnore
    private Licence licence;

    @Column(name = "nouvelle_date_fin", nullable = false)
    private LocalDate nouvelleDateFin;

    @Column(name = "statut", nullable = false, length = 20)
    private String statut; // "EN_ATTENTE", "APPROUVEE", "REJETEE"

    @Column(name = "date_creation", nullable = false)
    private LocalDateTime dateCreation;

    private Long demandeurId;

    public DemandeRenouvellement() {
    }

    public DemandeRenouvellement(Long id, Licence licence, LocalDate nouvelleDateFin, String statut, LocalDateTime dateCreation, Long demandeurId) {
        this.id = id;
        this.licence = licence;
        this.nouvelleDateFin = nouvelleDateFin;
        this.statut = statut;
        this.dateCreation = dateCreation;
        this.demandeurId = demandeurId;
    }
    public DemandeRenouvellement(Licence licence, LocalDate nouvelleDateFin, Long demandeurId) {
        this.licence = licence;
        this.nouvelleDateFin = nouvelleDateFin;
        this.demandeurId = demandeurId;
        this.statut = "En attente";
        this.dateCreation = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Licence getLicence() {
        return licence;
    }

    public void setLicence(Licence licence) {
        this.licence = licence;
    }

    public LocalDate getNouvelleDateFin() {
        return nouvelleDateFin;
    }

    public void setNouvelleDateFin(LocalDate nouvelleDateFin) {
        this.nouvelleDateFin = nouvelleDateFin;
    }

    public String getStatut() {
        return statut;
    }

    public void setStatut(String statut) {
        this.statut = statut;
    }

    public LocalDateTime getDateCreation() {
        return dateCreation;
    }

    public void setDateCreation(LocalDateTime dateCreation) {
        this.dateCreation = dateCreation;
    }

    public Long getDemandeurId() {
        return demandeurId;
    }

    public void setDemandeurId(Long demandeurId) {
        this.demandeurId = demandeurId;
    }
}
