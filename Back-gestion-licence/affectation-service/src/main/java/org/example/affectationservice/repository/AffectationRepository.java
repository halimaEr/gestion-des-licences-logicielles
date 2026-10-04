package org.example.affectationservice.repository;

import org.example.affectationservice.model.AffectationLicence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AffectationRepository extends JpaRepository<AffectationLicence,Long> {
    Optional<AffectationLicence> findByEmployeIdAndLicenceId(Long employeId, Long licenceId);

    List<AffectationLicence> findByLicenceId(Long licenceId);
    List<AffectationLicence> findByEmployeIdIn(List<Long> employeIds);

    List<AffectationLicence> findByEmployeId(Long idEmpl);
    @Query("SELECT DISTINCT a.employeId FROM AffectationLicence a")
    List<Long> findDistinctEmployeIds();

    List<AffectationLicence> findByDateAffectationBetween(LocalDate debut, LocalDate fin);

    Optional<AffectationLicence> findFirstByLicenceIdAndDateAffectationBetweenOrderByDateAffectationAsc(
            Long licenceId,
            LocalDate start,
            LocalDate end
    );

}
