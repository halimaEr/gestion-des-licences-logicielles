package ma.microservice.logiciel.repositories;

import ma.microservice.logiciel.entities.DemandeRenouvellement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DemandeRenouvellementRepository extends JpaRepository<DemandeRenouvellement,Long> {
    List<DemandeRenouvellement> findByLicenceId(Long licenceId);

    List<DemandeRenouvellement> findByDemandeurId(Long demandeurId);

    List<DemandeRenouvellement> findByStatut(String statut);


}
