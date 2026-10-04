package org.example.demandeservice.controller;

import org.example.demandeservice.dto.DemandeRequest;
import org.example.demandeservice.dto.DemandeResponseDTO;
import org.example.demandeservice.dto.EmployeDTO;
import org.example.demandeservice.dto.UtilisateurDTO;
import org.example.demandeservice.feignclients.ResponsableClient;
import org.example.demandeservice.model.Demande;
import org.example.demandeservice.service.DemandeService;
import org.example.demandeservice.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/demandes")
public class DemandeController {

    @Autowired
    private DemandeService demandeService;

    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private ResponsableClient responsableClient;



    @PostMapping("/create")
    public ResponseEntity<?> creerDemande(
            @RequestBody DemandeRequest request,
            @RequestHeader("Authorization") String authorizationHeader) {

        String token = authorizationHeader.substring(7);
        Long responsableId = jwtUtil.extractUserId(token);

        try {
            String message = demandeService.creerDemande(
                    request.getDemande(),
                    responsableId,
                    request.getGestionnaireEmail()
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(message);

        } catch (IllegalArgumentException e) {
            // Ici on renvoie directement le message d'erreur personnalisé
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }


    @GetMapping("/{id}")
    public ResponseEntity<DemandeResponseDTO> getDemande(@PathVariable Long id) {
        return ResponseEntity.ok(demandeService.getDemandeAvecDetails(id));
    }
    @GetMapping("/demande/{id}")
    public Demande getDemandeById(@PathVariable Long id) {
        return demandeService.getDemandeById(id);
    }

    @GetMapping
    public ResponseEntity<List<DemandeResponseDTO>> getAllDemandes() {
        return ResponseEntity.ok(demandeService.getAllDemandesAvecDetails());
    }
    @GetMapping("/all")
    public List<Demande> getAllDemandesSansDetails() {
        return demandeService.getAllDemandes();
    }
    @PutMapping("/{id}/accepter")
    public ResponseEntity<Map<String, String>> accepterDemande(@PathVariable Long id) {
        try {
            String response = demandeService.modifierStatutDemande(id, "Acceptée");
            return ResponseEntity.ok(Map.of(
                    "success", "true",
                    "message", response
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                            "success", "false",
                            "message", "Demande non trouvée."
                    ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", "false",
                            "message", "Erreur serveur lors de l'acceptation de la demande."
                    ));
        }
    }

    @PostMapping("/{id}/refuser")
    public ResponseEntity<Map<String, Object>> refuserDemande(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload) {

        String motif = payload.get("motif");
        if (motif == null || motif.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Le motif de refus est obligatoire."
            ));
        }

        try {
            // Récupérer le responsable pour son email
            Demande demande = demandeService.getDemandeById(id);
            if (demande == null) {
                return ResponseEntity.notFound().build();
            }

            Optional<UtilisateurDTO> userOpt = responsableClient.getUser(demande.getResponsableId());
            String emailResponsable = userOpt.map(UtilisateurDTO::getUsername).orElse(null);

            String message = demandeService.refuserDemandeAvecMotif(id, motif, emailResponsable);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", message
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "message", "Erreur lors du refus : " + e.getMessage()
            ));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> supprimerDemande(@PathVariable Long id) {
        String resultat = demandeService.supprimerDemande(id);
        if (resultat.equals("Demande supprimée avec succès.")) {
            return ResponseEntity.ok(resultat);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(resultat);
        }
    }


    @GetMapping("/responsable")
    public ResponseEntity<List<DemandeResponseDTO>> getDemandesByResponsable(
            @RequestHeader("Authorization") String authorizationHeader) {
        String token = authorizationHeader.substring(7); // Retire "Bearer "
        Long responsableId = jwtUtil.extractUserId(token); // méthode déjà utilisée chez toi
        List<DemandeResponseDTO> demandes = demandeService.getDemandesByResponsable(responsableId);
        return ResponseEntity.ok(demandes);
    }
    @GetMapping("/stats")
    public Map<String, Long> getDemandeStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("total", demandeService.counterDemandes());
        stats.put("acceptee", demandeService.counterDemandesByStatut("Acceptée"));
        stats.put("refusee", demandeService.counterDemandesByStatut("Refusée"));
        stats.put("enCours", demandeService.counterDemandesByStatut("En attente"));
        return stats;
    }



    // DemandeController.java

    @PostMapping("/lier")
    public ResponseEntity<?> lieDemandeParLogiciel(
            @RequestParam Long idDemande,
            @RequestParam Long idLogiciel) {

        demandeService.associerLogicielADemande(idDemande, idLogiciel);

        return ResponseEntity.ok().build();
    }


    @GetMapping("/{idDemande}/employes")
    public ResponseEntity<List<EmployeDTO>> getEmployesByDemandeId(@PathVariable Long idDemande) {
        List<EmployeDTO> employes = demandeService.getEmployesByDemandeId(idDemande);

        if (employes == null) {
            return ResponseEntity.notFound().build(); // 404 si demande introuvable
        }

        return ResponseEntity.ok(employes); // 200 OK avec la liste (même vide)
    }
}
