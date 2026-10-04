package ma.microservice.logiciel.controller;

import ma.microservice.logiciel.entities.Licence;
import ma.microservice.logiciel.entities.Logiciel;
import ma.microservice.logiciel.models.*;
import ma.microservice.logiciel.services.LicenceServices;
import ma.microservice.logiciel.services.LogicielServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/licences")
public class LicenceController {
    @Autowired
    private LicenceServices licenceServices;
    @Autowired
    private LogicielServices logicielServices;

    @GetMapping()
    public List<Licence> getLicences(){return licenceServices.getAllLicences();}

    @GetMapping("/{id}")
    public Licence getLicences(@PathVariable Long id){return licenceServices.getLicenceById(id);}

    @GetMapping("/verifier/{licenceId}")
    public boolean verifierAffectation(@PathVariable Long licenceId){
        return licenceServices.estAffecte(licenceId);
    }

    @GetMapping("/active")
    public ResponseEntity<List<Licence>> getLicencesActicve(){
         if(!licenceServices.getLicencesActive().isEmpty()) {
             return ResponseEntity
                     .status(HttpStatus.OK)
                     .body(licenceServices.getLicencesActive());
         }
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(licenceServices.getLicencesActive());
    }

    @GetMapping("/libre")
    public ResponseEntity<List<Licence>> getLicencesLibres(){
        if(!licenceServices.getLicencesLibres().isEmpty()) {
            return ResponseEntity
                    .status(HttpStatus.OK)
                    .body(licenceServices.getLicencesLibres());
        }
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(licenceServices.getLicencesLibres());
    }
    @GetMapping("/expired")
    public ResponseEntity<List<Licence>> getLicencesExpired(){
        if(!licenceServices.getLicencesExpirer().isEmpty()) {
            return ResponseEntity
                    .status(HttpStatus.OK)
                    .body(licenceServices.getLicencesExpirer());
        }
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(licenceServices.getLicencesExpirer());
    }

    @GetMapping("/expiring-soon")
    public ResponseEntity<List<Licence>> getLicencesExpiringSoon() {
        List<Licence> licences = licenceServices.getLicencesExpiringSoon();
        return ResponseEntity.ok(licences);
    }


    @GetMapping("/noaffecter")
    public ResponseEntity<List<Licence>> getLicenceNoAffecter(){
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(licenceServices.getLicencesNoAffecter());
    }

    @GetMapping("/stats")
    public Map<String, Long> getLicenceStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("totalLogiciels",logicielServices.conterLogiciel() );
        stats.put("totalLicences", licenceServices.conterLicences());
        return stats;
    }


    @GetMapping("/by-demande/{demandeId}")
    public ResponseEntity<Map<String, Object>> getLicencesByDemandeId(@PathVariable Long demandeId) {
        try {
            List<Licence> licences = licenceServices.getLicencesByDemandeId(demandeId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Licences récupérées avec succès");
            response.put("data", licences);
            response.put("count", licences.size());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Erreur lors de la récupération des licences: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }


    @PatchMapping("/{idlicence}/ronouvler")
    public ResponseEntity<?> ronouvlerLicence(@PathVariable Long idlicence,  @RequestParam LocalDate dateFin,@RequestHeader("Authorization") String authorizationHeader){
        Licence licence = licenceServices.getLicenceById(idlicence);
        if(licence != null){
            licenceServices.renouvlerLicence(licence,dateFin);
            return ResponseEntity
                    .status(HttpStatus.OK)
                    .body(Map.of(
                            "success", true,
                            "message", "licence a été ronouvlée"
                    ));
        }else {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                            "success", false,
                            "message", "La licence n’a pas été renouvelée"
                    ));
        }
    }


    // GET licences par département
    @GetMapping("/departement/{departementId}")
    public ResponseEntity<List<LicenceDetailDTO>> getLicencesByDepartement(@PathVariable Long departementId) {
        List<LicenceDetailDTO> licences = licenceServices.getLicencesParDepartement(departementId);

        if (licences.isEmpty()) {
            return ResponseEntity.noContent().build(); // 204 No Content si aucune licence
        }

        return ResponseEntity.ok(licences); // 200 OK avec la liste
    }

    @GetMapping("/departements")
    public List<DepartementStatsDTO> getStatsByDepartement() {
        return licenceServices.getStatsByDepartement();
    }


    @PutMapping("/{id}/liberer")
    public ResponseEntity<Licence> libererLicence(@PathVariable Long id) {
        Licence licence = licenceServices.libererLicence(id);
        return ResponseEntity.ok(licence);
    }

    @GetMapping("/couts-par-departement")
    public ResponseEntity<List<CoutsDepartementDTO>> getCoutsParDepartement(
            @RequestParam(required = false) Integer annee) {

        Integer year = (annee != null) ? annee : java.time.Year.now().getValue();
        List<CoutsDepartementDTO> data = licenceServices.getCoutsParDepartementParAnnee(year);
        return ResponseEntity.ok(data);
    }

    @GetMapping("/statistiques/par-logiciel")
    public ResponseEntity<List<CoutsLogicielDTO>> getCoutsParLogiciel(
            @RequestParam Integer annee,
            @RequestParam(required = false) Long departementId
    ) {
        List<CoutsLogicielDTO> result = licenceServices.getCoutsParLogicielParAnneeEtDepartement(annee, departementId);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/logiciel/{nom}/details")
    public ResponseEntity<List<EmployeUtilisationDTO>> getDetailsLogiciel(
            @PathVariable("nom") String nomLogiciel,
            @RequestParam("annee") Integer annee,
            @RequestParam(value = "departementId", required = false) Long departementId
    ) {
        try {
            List<EmployeUtilisationDTO> details = licenceServices.getDetailsLogiciel(nomLogiciel, annee, departementId);
            return ResponseEntity.ok(details);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

}
