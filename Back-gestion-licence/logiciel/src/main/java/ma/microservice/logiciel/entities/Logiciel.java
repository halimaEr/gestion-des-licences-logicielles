package ma.microservice.logiciel.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Data
public class Logiciel {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nom;
    private String version;
    private String categorie;
    private Integer nombreLicencesMax = 0;

    @OneToMany(mappedBy = "logiciel",fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Licence> licenceList = new ArrayList<>();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public String getCategorie() {
        return categorie;
    }

    public void setCategorie(String categorie) {
        this.categorie = categorie;
    }

    public List<Licence> getLicenceList() {
        return licenceList;
    }

    public void setLicenceList(List<Licence> licenceList) {
        this.licenceList = licenceList;
    }

    public Integer getNombreLicencesMax() {
        return nombreLicencesMax;
    }

    public void setNombreLicencesMax(Integer nombreLicencesMax) {
        this.nombreLicencesMax = nombreLicencesMax;
    }
}
