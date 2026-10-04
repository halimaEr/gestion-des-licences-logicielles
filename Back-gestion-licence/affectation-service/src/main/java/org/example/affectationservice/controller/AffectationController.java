package org.example.affectationservice.controller;

import org.example.affectationservice.dto.AffectationLicenceDetailDTO;
import org.example.affectationservice.model.AffectationLicence;
import org.example.affectationservice.service.AffectationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;


@RestController
@RequestMapping("/affectations")
public class AffectationController {
    private final AffectationService affectationService;


    public AffectationController(AffectationService affectationService) {
        this.affectationService = affectationService;
    }
    @PostMapping("/creer")
    public ResponseEntity<?> affecterLicence(@RequestBody AffectationLicence request) {
        return affectationService.affecterLicence(request);

    }

    @GetMapping("/verifier/licence/{licenceId}")
    public boolean estLicenceAffectee(@PathVariable Long licenceId) {
        return affectationService.estLicenceAffectee(licenceId);

    }


    @PostMapping("/by-employes")
    public List<AffectationLicence> getByEmployeIds(@RequestBody List<Long> employeIds) {
        return affectationService.getByEmployeIds(employeIds);
    }

    @GetMapping("/licence/{licenceId}")
    public ResponseEntity<AffectationLicence> getAffectationByLicenceId(@PathVariable Long licenceId) {
        AffectationLicence aff = affectationService.getAffectationByLicenceId(licenceId);
        return ResponseEntity.ok(new AffectationLicence(aff.getId(), aff.getEmployeId(), aff.getLicenceId(), aff.getDateAffectation()));
    }


    @GetMapping("/employe/{empId}")
    public List<AffectationLicence> getAffectOfEmploye(@PathVariable Long empId) {
        return affectationService.getAllLicenceOfEmploye(empId);
    }

    @GetMapping("/employe/{idEmploye}/licences")
    public ResponseEntity<List<AffectationLicenceDetailDTO>> getLicencesDetails(
            @PathVariable Long idEmploye) {
        List<AffectationLicenceDetailDTO> licences = affectationService.getLicencesDetailsByEmployeId(idEmploye);
        return ResponseEntity.ok(licences);
    }
    @DeleteMapping("/employe/{employeId}/licence/{licenceId}")
    public ResponseEntity<?> supprimerAffectation(
            @PathVariable Long employeId,
            @PathVariable Long licenceId,
            @RequestHeader("Authorization") String authorizationHeader) {
        return affectationService.supprimerAffectation(employeId, licenceId);
    }
    @GetMapping("/all")
    public List<AffectationLicence> getAllAffectations() {
        return affectationService.getAllAffectations();

    }

    @GetMapping("/par-date")
    List<AffectationLicence> getAffectationsParDate(@RequestParam("debut") LocalDate debut,@RequestParam("fin") LocalDate fin){
        return affectationService.getAffectationsParDate(debut,fin);

    }

    @GetMapping("/employes-with-licences")
    public ResponseEntity<List<Long>> getEmployeIdsWithLicences() {
        List<Long> employeIds = affectationService.getEmployeIdsWithLicences();
        return ResponseEntity.ok(employeIds);
    }

    @GetMapping("/premiere-dans-annee")
    public Optional<AffectationLicence> getPremiereAffectationDansAnnee(
            @RequestParam Long licenceId,
            @RequestParam Integer annee) {

        LocalDate debut = LocalDate.of(annee, 1, 1);
        LocalDate fin = LocalDate.of(annee, 12, 31);

        return affectationService.findFirstInYear(licenceId, debut, fin);
    }

}
