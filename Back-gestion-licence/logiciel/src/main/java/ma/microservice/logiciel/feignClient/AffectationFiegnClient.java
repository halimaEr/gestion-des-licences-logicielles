package ma.microservice.logiciel.feignClient;

import ma.microservice.logiciel.models.AffectationDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@FeignClient(value = "affectation-service")
public interface AffectationFiegnClient {
    @GetMapping("/affectations/verifier/licence/{licenceId}")
     boolean estLicenceAffectee(@PathVariable Long licenceId);

    @PostMapping("/affectations/by-employes")
    List<AffectationDTO> getByEmployeIds(@RequestBody List<Long> employeIds);

    @GetMapping("/affectations/licence/{licenceId}")
    ResponseEntity<AffectationDTO> getAffectationByLicenceId(@PathVariable Long licenceId) ;
    @GetMapping("/affectations/all")
    List<AffectationDTO> getAllAffectations();

    @GetMapping("/affectations/par-date")
    List<AffectationDTO> getAffectationsParDate(
            @RequestParam("debut") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate debut,
            @RequestParam("fin") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fin
    );

    @GetMapping("/affectations/premiere-dans-annee")
    Optional<AffectationDTO> getPremiereAffectationDansAnnee(@RequestParam Long licenceId, @RequestParam Integer annee);

}
