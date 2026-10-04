package ma.microservice.logiciel.repositories;

import ma.microservice.logiciel.entities.Logiciel;
import ma.microservice.logiciel.models.LogicielStatsDTO;
import org.springframework.beans.PropertyValues;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface LogicielRepository extends JpaRepository<Logiciel,Long> {
     Logiciel findByNomAndVersion(String nom,String version);
    @Query("SELECT new ma.microservice.logiciel.models.LogicielStatsDTO(l.nom, COUNT(lc.id)) " +
            "FROM Logiciel l " +
            "LEFT JOIN l.licenceList lc " +
            "GROUP BY l.id, l.nom " +
            "ORDER BY COUNT(lc.id) DESC")
    List<LogicielStatsDTO> findTop5ByNombreLicences();


}
