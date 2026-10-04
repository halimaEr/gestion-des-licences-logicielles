package ma.microservice.logiciel.repositories;

import ma.microservice.logiciel.entities.Licence;
import ma.microservice.logiciel.enumerated.StatutLicence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface LicenceRepository extends JpaRepository<Licence, Long> {
    Licence findByCleLicence(String cle);

    List<Licence> findByStatut(StatutLicence statutLicence);
    List<Licence> findByDemandeId(Long demandeId);

    List<Licence> findByDateFinBetween(LocalDate start, LocalDate end);
    @Modifying
    @Query("UPDATE Licence l SET l.statut = :statut WHERE l.statut = :ancienStatut AND l.dateFin < :date")
    void mettreAJourStatutLicences(@Param("ancienStatut") StatutLicence ancienStatut,
                                   @Param("statut") StatutLicence nouveauStatut,
                                   @Param("date") LocalDate date);

    int countByDemandeId(Long demandeId);


    @Query("SELECT l FROM Licence l WHERE l.dateAchat BETWEEN :debut AND :fin")
    @Modifying(clearAutomatically = true) // ← Force le clear du cache L1
    List<Licence> findByDateAchatBetween(@Param("debut") LocalDate debut, @Param("fin") LocalDate fin);

}

