package ma.microservice.logiciel.controller;

import ma.microservice.logiciel.entities.DemandeRenouvellement;
import ma.microservice.logiciel.models.DemandeRenouvellementDTO;
import ma.microservice.logiciel.models.DemandeRenouvellementResponse;
import ma.microservice.logiciel.services.DemandeRenouvellementService;
import ma.microservice.logiciel.services.LicenceServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/demandes-renouvellement")
public class DemandeRenouvellementController {
    @Autowired
    private DemandeRenouvellementService demandeRenouvellementService;

    @Autowired
    private LicenceServices licenceService;

    @PostMapping("/envoyer")
    public ResponseEntity<DemandeRenouvellement> envoyerDemande(@RequestBody DemandeRenouvellementDTO dto) {
        var licence = licenceService.getLicenceById(dto.getLicenceId());
        if (licence == null) {
            return ResponseEntity.notFound().build();
        }


        var demande = new DemandeRenouvellement(
                licence,
                dto.getNouvelleDateFin(),
                dto.getDemandeurId()
        );

        demande = demandeRenouvellementService.sauvegarder(demande);
        return ResponseEntity.ok(demande);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DemandeRenouvellement> getDemandeById(@PathVariable Long id) {
        Optional<DemandeRenouvellement> demande = demandeRenouvellementService.findById(id);
        return demande.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<DemandeRenouvellementResponse>> getAllDemandesEnrichies() {
        List<DemandeRenouvellementResponse> demandes = demandeRenouvellementService.findAllEnrichi();
        return ResponseEntity.ok(demandes);
    }

    @GetMapping("/licence/{licenceId}")
    public List<DemandeRenouvellement> getDemandesByLicence(@PathVariable Long licenceId) {
        return demandeRenouvellementService.findByLicenceId(licenceId);
    }

    @GetMapping("/demandeur/{demandeurId}")
    public List<DemandeRenouvellement> getDemandesByDemandeur(@PathVariable Long demandeurId) {
        return demandeRenouvellementService.findByDemandeurId(demandeurId);
    }

    @GetMapping("/statut/{statut}")
    public List<DemandeRenouvellement> getDemandesByStatut(@PathVariable String statut) {
        return demandeRenouvellementService.findByStatut(statut);
    }

    @GetMapping("/en-attente")
    public List<DemandeRenouvellement> getDemandesEnAttente() {
        return demandeRenouvellementService.findPendingDemandes();
    }

    @PutMapping("/{id}/approuver")
    public ResponseEntity<DemandeRenouvellement> approuverDemande(@PathVariable Long id) {
        DemandeRenouvellement demande = demandeRenouvellementService.approuverDemande(id);
        if (demande != null) {
            return ResponseEntity.ok(demande);
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}/rejeter")
    public ResponseEntity<DemandeRenouvellement> rejeterDemande(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload) {

        String motifRefus = payload.get("motifRefus");
        if (motifRefus == null || motifRefus.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        DemandeRenouvellement demande = demandeRenouvellementService.rejeterDemande(id, motifRefus);
        if (demande != null) {
            return ResponseEntity.ok(demande);
        }
        return ResponseEntity.notFound().build();
    }



    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDemande(@PathVariable Long id) {
        Optional<DemandeRenouvellement> demande = demandeRenouvellementService.findById(id);
        if (demande.isPresent()) {
            demandeRenouvellementService.deleteDemande(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }


}
