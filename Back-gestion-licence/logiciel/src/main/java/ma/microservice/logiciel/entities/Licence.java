package ma.microservice.logiciel.entities;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import ma.microservice.logiciel.enumerated.StatutLicence;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDate;
import java.util.Date;

@Entity
@AllArgsConstructor
@Data
public class Licence {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonProperty("id") // ← Force la sérialisation du champ "id" en JSON
    private Long id;
    private String cleLicence;
    private float prix;
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private LocalDate dateExpiration;
    @Column(name = "date_achat")
    private LocalDate dateAchat;
    @Column(name = "statut", length = 20, nullable = false)
    @Enumerated(EnumType.STRING)
    private StatutLicence statut = StatutLicence.ACTIVE;
    private Long demandeId;


    @ManyToOne
    @OnDelete(action = OnDeleteAction.CASCADE)
    // @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private Logiciel logiciel;


    public Licence() {
    }

    public LocalDate getDateAchat() {
        return dateAchat;
    }

    public void setDateAchat(LocalDate dateAchat) {
        this.dateAchat = dateAchat;
    }

    public Long getDemandeId() {
        return demandeId;
    }

    public void setDemandeId(Long demandeId) {
        this.demandeId = demandeId;
    }

    public Long getId() {
        return id;
    }

    public String getCleLicence() {
        return cleLicence;
    }

    public float getPrix() {
        return prix;
    }

    public LocalDate getDateDebut() {
        return dateDebut;
    }

    public LocalDate getDateFin() {
        return dateFin;
    }

    public StatutLicence getStatut() {
        return statut;
    }

    public Logiciel getLogiciel() {
        return logiciel;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setCleLicence(String cleLicence) {
        this.cleLicence = cleLicence;
    }

    public void setPrix(float prix) {
        this.prix = prix;
    }

    public void setDateDebut(LocalDate dateDebut) {
        this.dateDebut = dateDebut;
    }

    public void setDateFin(LocalDate dateFin) {
        this.dateFin = dateFin;
    }

    public void setStatut(StatutLicence statut) {
        this.statut = statut;
    }

    public void setLogiciel(Logiciel logiciel) {
        this.logiciel = logiciel;
    }

    public LocalDate getDateExpiration() {
        return dateExpiration;
    }

    public void setDateExpiration(LocalDate dateExpiration) {
        this.dateExpiration = dateExpiration;
    }
}
