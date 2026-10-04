package ma.microservice.logiciel.controller;

import ma.microservice.logiciel.entities.Licence;
import ma.microservice.logiciel.entities.Logiciel;
import ma.microservice.logiciel.models.CreateLogicielRequest;
import ma.microservice.logiciel.feignClient.DemandeClient;
import ma.microservice.logiciel.models.DemandeDTO;
import ma.microservice.logiciel.models.LogicielStatsDTO;
import ma.microservice.logiciel.services.LicenceServices;
import ma.microservice.logiciel.services.LogicielServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@RefreshScope // actialiser les params qui ont avoir @value car il sont des variables de configuration
@RestController
@RequestMapping("/logiciels")
public class LogicielController {
    @Autowired
    private LogicielServices logicielServices;
    @Autowired
    private LicenceServices licenceServices;
    @Autowired
    private DemandeClient demandeClient;


    @GetMapping()
    public List<Logiciel> getLogiciels(){return logicielServices.getLogiciels();}

    @GetMapping("/{id}")
    public Logiciel getLogicielById(@PathVariable Long id){
        return logicielServices.getLogicielById(id);
    }



    @PostMapping("/add-avec-demande")
    public ResponseEntity<?> creerLogicielEtLierADemande(@RequestBody CreateLogicielRequest request) {

        Logiciel logiciel = request.getLogiciel();
        Long idDemande = request.getIdDemande();
        DemandeDTO existDemande = demandeClient.getDemandeById(idDemande);
        if ("Acceptée".equals(existDemande.getStatut())) {
            logiciel.setNombreLicencesMax(existDemande.getNbLicences());
        }
        // Vérifier que la demande  exist car chaque demande contient un idLogiciel et je recupere ici id de la demande
        // pour la liason  comme on sait si user choisi autre idLogiciel null mais apres la creation de logiciel on doit injecter id avec sa valeur
        if (demandeClient.getDemandeById(idDemande) == null) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "message", "La demande de cette logiciel n'exist pas "
                    ));
        }

        // Vérifier que le logiciel n'existe pas déjà
        if (logicielServices.existLogiciel(logiciel.getNom(), logiciel.getVersion()) != null) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of(
                            "success", false,
                            "message", "Le logiciel existe déjà avec les mêmes informations "
                    ));
        }

            //  Sauvegarder le logiciel et obtient l'ID généré
            Logiciel nouveauLogiciel = logicielServices.addLogiciel(logiciel);
            Long idLogiciel = nouveauLogiciel.getId();

            //  Appeler le microservice "demande" pour lier la demande avec le logiciel
            try {
                demandeClient.lieDemandeParLogiciel(idDemande, idLogiciel);
            } catch (Exception e) {
                // annuler la création si la liaison échoue
                logicielServices.deleteLogiciel(idLogiciel);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of(
                                "success", false,
                                "message", "la liaison  du logiciel avec  la demande a échoué "
                        ));
            }

            // Succès
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of(
                            "success", true,
                            "message", "Le logiciel a été ajouté avec succès."
                    ));
        }

    @PostMapping("/add")
    public ResponseEntity<?> addLogiciel(@RequestBody Logiciel logiciel,@RequestHeader("Authorization") String authorizationHeader){
        Logiciel logicielExist = logicielServices.existLogiciel(logiciel.getNom(),logiciel.getVersion());
        if(logicielExist == null){
            logicielServices.addLogiciel(logiciel);
            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(Map.of(
                            "success", true,
                            "message", "Le logiciel a été ajouté avec succès."
                    ));
        }else{
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(Map.of(
                            "success", false,
                            "message", "Le logiciel existe déjà avec les mêmes informations "
                    ));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateLogiciel(@PathVariable("id") Long id, @RequestBody Logiciel newlogiciel,@RequestHeader("Authorization") String authorizationHeader){
        Logiciel logicielExist = logicielServices.getLogicielById(id);
        Logiciel existAvecMemeVersionAndCategorie = logicielServices.existLogiciel(newlogiciel.getNom(),newlogiciel.getVersion());
        if(existAvecMemeVersionAndCategorie != null) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(Map.of(
                            "success", false,
                            "message", "Le logiciel existe déjà avec les mêmes informations (Meme nom et meme Version)."
                    ));
        }

        if(logicielExist != null){
            logicielServices.updateLogiciel(logicielExist,newlogiciel);
            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(Map.of(
                            "success", true,
                            "message", "Le logiciel a été modifié."
                    ));
        }else{
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                            "success", false,
                            "message", "Erreur lors de la modification."
                    ));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteLogiciel(@PathVariable Long id,@RequestHeader("Authorization") String authorizationHeader){
        Logiciel logicielExist = logicielServices.getLogicielById(id);
        List<DemandeDTO> demandeDTOList = demandeClient.getAllDemandesSansDetails();
        int cntour=0;
       for(DemandeDTO d : demandeDTOList){
           if(d.getLogicielId() == id){
               cntour++;
           }
       }
        if(logicielExist != null){
            if(cntour != 0){
                return ResponseEntity
                        .status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of(
                                "success", false,
                                "message", "Le logiciel  lie avec une demande tu doit supprimer la demande et puis ressayer ."
                        ));

            }
            List<Licence> licenceList = logicielExist.getLicenceList();
            if(licenceList.isEmpty()) {
                logicielServices.deleteLogiciel(id);
                return ResponseEntity
                        .status(HttpStatus.OK)
                        .body(Map.of(
                                "success", true,
                                "message", "Le logiciel a été supprimé."
                        ));

            }else{
                return ResponseEntity
                        .status(HttpStatus.NOT_ACCEPTABLE)  .body(Map.of(
                                "success", false,
                                "message", "Le logiciel n'a pas été supprimé car il possède des licences."
                        ));

            }
        }else{
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(" Le logiciel n'existe pas.");
        }
    }

    @PutMapping("/{id}/modifiernbrlicence/{newnbrLicence}")
    public Integer updateNbrLicenceOfLogiciel(@PathVariable("id") Long id, @PathVariable Integer newnbrLicence,@RequestHeader("Authorization") String authorizationHeader){
      return logicielServices.modifierNbrLicence(id,newnbrLicence);
    }


    // """""""""""""""  les licences de logiciel""""""""""""""""""""""""

    @GetMapping("/{idlogiciel}/licences")
    public ResponseEntity<?> getLicencesOfLogiciel(@PathVariable("idlogiciel") Long idlogiciel){
        Logiciel logiciel = logicielServices.getLogicielById(idlogiciel);
        if(logiciel != null){
            List<Licence> licenceList=logicielServices.getLicencesOfLigiciel(idlogiciel);
            return ResponseEntity
                    .status(HttpStatus.OK)
                    .body(licenceList);
        }else {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Le logiciel n'existe pas.");
        }

    }
    @GetMapping("/{idlogiciel}/licences/noaffecter")
    public ResponseEntity<?> getLicencesNoAffecteOfLogiciel(@PathVariable("idlogiciel") Long idlogiciel){
        Logiciel logiciel = logicielServices.getLogicielById(idlogiciel);
        if(logiciel != null){
            List<Licence> licenceList=logicielServices.getLicencesNoAffecterOfLigiciel(idlogiciel);
            return ResponseEntity
                    .status(HttpStatus.OK)
                    .body(licenceList);
        }else {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                            "success", false,
                            "message", "Le logiciel n'exist pas."
                    ));
        }

    }

    @GetMapping("/{idlogiciel}/licences/{idlicence}")
    public ResponseEntity<?> getLicenceOfLogicielByID(@PathVariable("idlogiciel") Long idlogiciel,@PathVariable Long idlicence){
        Logiciel logiciel = logicielServices.getLogicielById(idlogiciel);
        if(logiciel != null){
            Licence licence = licenceServices.getLicenceById(idlicence);
            return ResponseEntity
                    .status(HttpStatus.OK)
                    .body(Map.of(
                            "success", true,
                            "message", licence
                    ));

        }else {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                            "success", false,
                            "message", "Le logiciel n'existe pas"
                    ));
        }

    }

    @PostMapping("/{logicielId}/licences/multiple")
    public ResponseEntity<?> addMultipleLicences(
            @PathVariable Long logicielId,
            @RequestBody List<Licence> licences) {

        try {
            Map<String, Object> result = logicielServices.createMultipleLicences(logicielId, licences);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Erreur serveur : " + e.getMessage()
            ));
        }
    }

    @PostMapping("/{idlogiciel}/licences/add")
    public ResponseEntity<Map<String, Object>> addLicenceToLogiciel(
            @PathVariable("idlogiciel") Long idLogiciel,
            @RequestBody Licence licence
    ) {
        try {
            // Vérifier que le logiciel existe
            Logiciel logiciel = logicielServices.getLogicielById(idLogiciel);
            if (logiciel == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                        "success", false,
                        "message", "Logiciel non trouvé avec l'ID : " + idLogiciel
                ));
            }

            //  Vérifier que la licence est valide
            if (licence == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                        "success", false,
                        "message", "Les données de la licence sont manquantes."
                ));
            }

            //  Récupérer le demandeId
            Long demandeId = licence.getDemandeId();

            // Appeler la méthode du service → retourne la licence SAUVEGARDÉE
            Licence savedLicence = logicielServices.addLicenceToLogiciel(idLogiciel, licence, demandeId);

            //  Réponse de succès → avec licenceId VALIDE
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "success", true,
                    "message", "Licence ajoutée avec succès au logiciel.",
                    "data", Map.of(
                            "licenceId", savedLicence.getId(), //  ID maintenant VALIDE
                            "logicielId", idLogiciel,
                            "demandeId", demandeId,
                            "nomLogiciel", logiciel.getNom(),
                            "cleLicence", savedLicence.getCleLicence() // optionnel
                    )
            ));

        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "success", false,
                    "message", "Logiciel introuvable."
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "message", "Erreur serveur : " + e.getMessage()
            ));
        }
    }


    @PutMapping("/{idlogiciel}/licences/{idlicence}")
    public ResponseEntity<?> updateLicenceOfLogiciel(@PathVariable Long idlogiciel,@PathVariable Long idlicence ,@RequestBody Licence newlicence,@RequestHeader("Authorization") String authorizationHeader){
        Logiciel logiciel = logicielServices.getLogicielById(idlogiciel);
        Licence existlicence = licenceServices.getLicenceById(idlicence);
        if(logiciel != null && existlicence != null && newlicence != null){
            logicielServices.updateLicenceOfLogiciel(idlicence,newlicence);
            return ResponseEntity
                    .status(HttpStatus.OK)
                    .body(Map.of(
                            "success", true,
                            "message", "La licence a été modifiée avec succès."
                    ));
        }else {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                            "success", false,
                            "message", "La licence n’a pas été modifiée."
                    ));
        }

    }

    @DeleteMapping("/{idlogiciel}/licences/{idlicence}")
    public ResponseEntity<?> SupprimerLicenceOfLogiciel(@PathVariable Long idlogiciel,@PathVariable Long idlicence,@RequestHeader("Authorization") String authorizationHeader){
        Logiciel logiciel = logicielServices.getLogicielById(idlogiciel);
        Licence licence = licenceServices.getLicenceById(idlicence);
        boolean estAffecte = licenceServices.estAffecte(idlicence);
        if (estAffecte) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                    "success", false,
                    "message", "Impossible de supprimer cette licence : elle est déjà affectée . Veuillez supprimer les affectations d'abord.",
                    "code", "LICENCE_AFFECTEE"
            ));
        }
        else if(logiciel != null && licence != null && !estAffecte){
            logicielServices.deleteLicenceOfLogiciel(logiciel,licence);
            return ResponseEntity
                    .status(HttpStatus.OK)
                    .body(Map.of(
                            "success", true,
                            "message", "La licence a été supprimée avec succès"
                    ));
        }else {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                            "success", false,
                            "message", "La licence n’a pas été supprimée"
                    ));

        }


    }

    @PatchMapping("/{idlogiciel}/licences/{idlicence}")
    public ResponseEntity<?> updateLicenceStatusDisable(@PathVariable Long idlogiciel,@PathVariable Long idlicence,@RequestHeader("Authorization") String authorizationHeader){
        Logiciel logiciel = logicielServices.getLogicielById(idlogiciel);
        Licence licence = licenceServices.getLicenceById(idlicence);
        if(logiciel != null && licence != null){
            logicielServices.disableStatusOfLicence(licence);
            return ResponseEntity
                    .status(HttpStatus.OK)
                    .body(Map.of(
                            "success", true,
                            "message", "La licence a été modifiée avec succès."
                    ));
        }else {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                            "success", false,
                            "message", "La licence n’a pas été modifiée."
                    ));
        }
    }


    @GetMapping("/top-logiciels")
    public List<LogicielStatsDTO> getTop5Logiciels() {
        return logicielServices.getTop5Logiciels();
    }





}

