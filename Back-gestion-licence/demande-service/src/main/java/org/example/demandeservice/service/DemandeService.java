package org.example.demandeservice.service;

import org.example.demandeservice.dto.*;
import org.example.demandeservice.feignclients.EmployeClient;
import org.example.demandeservice.feignclients.LogicielClient;
import org.example.demandeservice.feignclients.ResponsableClient;
import org.example.demandeservice.model.Demande;
import org.example.demandeservice.repository.DemandeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DemandeService {

    @Autowired
    private DemandeRepository demandeRepository;
    @Autowired
    private ResponsableClient responsableClient;
    @Autowired
    private EmployeClient employeClient;
    @Autowired
    private final JavaMailSender mailSender;
    @Autowired
    private LogicielClient logicielClient;

    public DemandeService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendNotificationEmail(String to, String subject, String text) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);
        mailSender.send(message);
    }


    public String creerDemande(Demande demandeDto, Long responsableId, String gestionnaireEmail) {

        if (demandeDto == null) {
            throw new IllegalArgumentException("Les informations de la demande sont manquantes.");
        }

        if (demandeDto.getNbLicences() <= 0) {
            throw new IllegalArgumentException("Le nombre de licences doit être positif.");
        }

        if (demandeDto.getEmployeIds() == null || demandeDto.getEmployeIds().isEmpty()) {
            throw new IllegalArgumentException("Au moins un employé doit être sélectionné.");
        }

        // 1. Cas : Nouveau logiciel (logicielId = null)
        if (demandeDto.getLogicielId() == null) {
            if (demandeDto.getNouveauNomLogiciel() == null || demandeDto.getNouveauNomLogiciel().trim().isEmpty()) {
                throw new IllegalArgumentException("Le nom du nouveau logiciel est requis.");
            }

            // On laisse logicielId = null
            // On stocke le nom temporairement
            demandeDto.setNouveauNomLogiciel(demandeDto.getNouveauNomLogiciel().trim());

            // On n'envoie pas de requête au microservice logiciel
            // On envoie un email au gestionnaire
            sendNotificationEmail(
                    gestionnaireEmail,
                    "Nouvelle demande - Nouveau logiciel",
                    "Bonjour,\n\n" +
                            "Une demande concerne un **nouveau logiciel** :\n\n" +
                            "• Nom du logiciel : " + demandeDto.getNouveauNomLogiciel() + "\n" +
                            "• Licences demandées : " + demandeDto.getNbLicences() + "\n" +
                            "• Informations supplémentaires : " + demandeDto.getDescription() + "\n\n"

            );
            try {
                sendNotificationEmail(
                        gestionnaireEmail,
                        "Nouvelle demande de licence - " + demandeDto.getNouveauNomLogiciel(),
                        "Bonjour,\n\n" +
                                "Une demande concerne un **nouveau logiciel** :\n\n" +
                                "• Nom du logiciel : " + demandeDto.getNouveauNomLogiciel() + "\n" +
                                "• Licences demandées : " + demandeDto.getNbLicences() + "\n" +
                                "• Informations supplémentaires : " + demandeDto.getDescription() + "\n\n"+
                                "Connectez-vous à l'application pour traiter cette demande,\n" +
                                "Votre application de gestion des licences"
                );
            } catch (Exception e) {
                throw new IllegalArgumentException(
                        "Activez votre connexion Internet pour qu'on puisse traiter votre demande rapidement "
                );
            }

        }
        // 2. Cas : Logiciel existant
        else {
            // Vérifier que le logiciel existe
            LogicielDTO logicielDetails;
            try {
                logicielDetails = logicielClient.getLogicielById(demandeDto.getLogicielId());
                //logicielClient.updateNbrLicenceOfLogiciel(demandeDto.getLogicielId(), demandeDto.getNbLicences());
                if (logicielDetails == null) {
                    throw new IllegalArgumentException("Logiciel non trouvé avec l'ID: " + demandeDto.getLogicielId());
                }
            } catch (Exception e) {
                throw new IllegalArgumentException("Erreur lors de la récupération du logiciel: " + e.getMessage());
            }

            // Vérifier qu'aucune demande similaire n'existe déjà
            List<Demande> demandesExistantes = demandeRepository.findByLogicielId(demandeDto.getLogicielId());
            boolean employesEnCommun = demandesExistantes.stream()
                    .anyMatch(d -> !Collections.disjoint(d.getEmployeIds(), demandeDto.getEmployeIds()));

            if (employesEnCommun) {
                throw new IllegalArgumentException(
                        "Une demande pour ce logiciel avec les mêmes employés existe déjà."
                );
            }

            // Envoyer email pour logiciel existant

           try {
                sendNotificationEmail(
                        gestionnaireEmail,
                        "Nouvelle demande de licence - " + logicielDetails.getNom(),
                        "Bonjour,\n\n" +
                                "Une nouvelle demande a été soumise :\n\n" +
                                "• Logiciel: " + logicielDetails.getNom() + "\n" +
                                "• Nombre de licences: " + demandeDto.getNbLicences() + "\n" +
                                "• Description: " + demandeDto.getDescription() + "\n\n" +
                                "Connectez-vous à l'application pour traiter cette demande,\n" +
                                "Votre application de gestion des licences"
                );
            } catch (Exception e) {
                throw new IllegalArgumentException(
                        "Activez votre connexion Internet pour qu'on puisse traiter votre demande rapidement "
                );
            }
        }

        // 3. Sauvegarder la demande
        Demande nouvelleDemande = new Demande();
        nouvelleDemande.setLogicielId(demandeDto.getLogicielId());
        nouvelleDemande.setNbLicences(demandeDto.getNbLicences());
        nouvelleDemande.setFournisseur(demandeDto.getFournisseur());
        nouvelleDemande.setDescription(demandeDto.getDescription());
        nouvelleDemande.setStatut("En attente");
        nouvelleDemande.setResponsableId(responsableId);
        nouvelleDemande.setEmployeIds(demandeDto.getEmployeIds());
        nouvelleDemande.setDate(LocalDate.now());

        // Stocker le nom si c'est un nouveau logiciel
        if (demandeDto.getLogicielId() == null) {
            nouvelleDemande.setNouveauNomLogiciel(demandeDto.getNouveauNomLogiciel());
        }

        demandeRepository.save(nouvelleDemande);

        return "Demande envoyée avec succès";
    }


    public DemandeResponseDTO getDemandeAvecDetails(Long id) {
        Demande demande = demandeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Demande non trouvée"));

        DemandeResponseDTO dto = new DemandeResponseDTO();
        dto.setId(demande.getId());
        dto.setNbLicences(demande.getNbLicences());
        dto.setFournisseur(demande.getFournisseur());
        dto.setDescription(demande.getDescription());
        dto.setStatut(demande.getStatut());

        // Logiciel existant ou nouveau
        if (demande.getLogicielId() != null) {
            try {
                dto.setLogicielId(demande.getLogicielId());
                LogicielDTO logicielDetails = logicielClient.getLogicielById(demande.getLogicielId());
                if (logicielDetails != null) {
                    dto.setNomLogiciel(logicielDetails.getNom());
                    dto.setVersionLogiciel(logicielDetails.getVersion());
                    dto.setCategorieLogiciel(logicielDetails.getCategorie());
                } else {
                    dto.setNomLogiciel("Introuvable");
                    dto.setVersionLogiciel("Introuvable");
                    dto.setCategorieLogiciel("Introuvable");
                }
            } catch (Exception e) {
                System.err.println("Erreur appel microservice logiciel pour ID=" + demande.getLogicielId());
                dto.setNomLogiciel("Erreur de chargement");
                dto.setVersionLogiciel("Erreur");
                dto.setCategorieLogiciel("Erreur");
            }
        } else {
            dto.setNomLogiciel(demande.getNouveauNomLogiciel());
            dto.setVersionLogiciel(null);
            dto.setCategorieLogiciel(null);
            dto.setLogicielId(null);
        }


        try {
            Optional<UtilisateurDTO> userOpt = responsableClient.getUser(demande.getResponsableId());

            if (userOpt.isPresent()) {
                UtilisateurDTO user = userOpt.get();
                String nomComplet = (user.getPrenom() != null ? user.getPrenom() : "") + " " +
                        (user.getNom() != null ? user.getNom() : "").trim();
                dto.setResponsable(nomComplet.isEmpty() ? "Inconnu" : nomComplet);

                // Département
                String departement = "Non disponible";
                try {
                    ResponseEntity<String> deptResponse = responsableClient.getDepartmentByResponsableId(user.getId());
                    if (deptResponse.getStatusCode() == HttpStatus.OK && deptResponse.getBody() != null) {
                        departement = deptResponse.getBody();
                    }
                } catch (Exception e) {
                    System.err.println("Erreur département pour ID=" + user.getId());
                }
                dto.setDepartementResponsable(departement);

            } else {
                dto.setResponsable("Inconnu");
                dto.setDepartementResponsable("Non disponible");
            }
        } catch (Exception e) {
            System.err.println("Erreur récupération responsable ID=" + demande.getResponsableId());
            dto.setResponsable("Erreur de chargement");
            dto.setDepartementResponsable("Erreur");
        }

        // Employés
        List<EmployeDTO> employes = new ArrayList<>();
        if (demande.getEmployeIds() != null) {
            for (Long empId : demande.getEmployeIds()) {
                try {
                    Optional<EmployeDTO> empOpt = employeClient.getEmployeById(empId);
                    empOpt.ifPresent(employes::add);
                } catch (Exception e) {
                    System.err.println("Erreur lors de la récupération de l'employé ID=" + empId);
                }
            }
        }
        dto.setEmployes(employes);

        return dto;
    }

    public Demande getDemandeById(Long id){
        return demandeRepository.findById(id).orElse(null);
    }


    public List<DemandeResponseDTO> getAllDemandesAvecDetails() {
        return demandeRepository.findAll().stream()
                .map(demande -> getDemandeAvecDetails(demande.getId()))
                .collect(Collectors.toList());
    }

    public List<Demande> getAllDemandes() {
        return demandeRepository.findAll();
    }

/*    public String modifierStatutDemande(Long id, String nouveauStatut) {
        Demande demande = demandeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Demande non trouvée"));

        demande.setStatut(nouveauStatut);
        demandeRepository.save(demande);

        return "Demande marquée comme " + nouveauStatut.toLowerCase() + ".";
    }*/

public String modifierStatutDemande(Long id, String nouveauStatut) {
    Demande demande = demandeRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Demande non trouvée"));

    demande.setStatut(nouveauStatut);
    demandeRepository.save(demande);

    return "Demande marquée comme " + nouveauStatut.toLowerCase() + ".";
}




    public String supprimerDemande(Long id) {
        return demandeRepository.findById(id)
                .map(demande -> {
                    demandeRepository.deleteById(id);
                    return "Demande supprimée avec succès.";
                })
                .orElse("Demande non trouvée.");
    }


    public List<DemandeResponseDTO> getDemandesByResponsable(Long responsableId) {
        List<Demande> demandes = demandeRepository.findByResponsableId(responsableId);
        return demandes.stream()
                .map(demande -> getDemandeAvecDetails(demande.getId()))
                .collect(Collectors.toList());
    }

    public long counterDemandes(){
        return demandeRepository.count();
    }
    public long counterDemandesByStatut(String status){
        return demandeRepository.countByStatut(status);
    }

    // DemandeService.java

    public ResponseEntity<?> associerLogicielADemande(Long idDemande, Long idLogiciel) {
        Demande demande = demandeRepository.findById(idDemande).orElse(null);
        if(demande == null){
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                            "success", false,
                            "message", "Demande n'exist pas "
                    ));
        }

        // Vérifier que la demande n'a pas déjà un logiciel
        if (demande.getLogicielId() != null) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "message", "Cette demande est déjà liée à un logiciel."
                    ));
        }

        // Mettre à jour la demande
        demande.setLogicielId(idLogiciel);
        demandeRepository.save(demande);
        return ResponseEntity.status(HttpStatus.OK)
                .body(Map.of(
                        "success", true,
                        "message", "Demande acceptée "
                ));
    }


    public List<EmployeDTO> getEmployesByDemandeId(Long idDemande) {
        // 1. Trouver la demande
        Demande demande = demandeRepository.findById(idDemande)
                .orElse(null);
        if (demande == null) {
            return null;
        }

        // 2. Extraire les IDs des employés
        List<Long> employeIds = demande.getEmployeIds();
        if (employeIds == null || employeIds.isEmpty()) {
            return Collections.emptyList();
        }

        // 3. Appeler le microservice Employe via Feign
        try {
            return employeClient.getEmployesByIds(employeIds);

        } catch (Exception e) {
            // Log l'erreur (tu peux utiliser un Logger au lieu de printStackTrace)
            e.printStackTrace();
            // En production, tu pourrais lever une exception métier ou retourner une liste vide
            return Collections.emptyList();
        }
    }

    public String refuserDemandeAvecMotif(Long id, String motif, String emailResponsable) {
        Demande demande = demandeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Demande non trouvée"));

        demande.setStatut("Refusée");
        demandeRepository.save(demande);

        // Envoyer email au responsable
        if (emailResponsable != null && !emailResponsable.trim().isEmpty()) {
            try {
                sendNotificationEmail(
                        emailResponsable,
                        "Votre demande a été refusée",
                        "Bonjour,\n\n" +
                                "Votre demande concernant \"" +
                                (demande.getLogicielId() != null ?
                                        getNomLogiciel(demande.getLogicielId()) :
                                        demande.getNouveauNomLogiciel()) +
                                "\" a été **refusée**.\n\n" +
                                "Motif : " + motif + "\n\n" +
                                "Merci de contacter le service gestionnaire pour plus d'informations.\n" +
                                "Votre application de gestion des licences"
                );
            } catch (Exception e) {
                System.err.println("Erreur envoi email refus : " + e.getMessage());
                // On ne bloque pas la sauvegarde si l'email échoue
            }
        }

        return "Demande refusée avec succès.";
    }


    private String getNomLogiciel(Long logicielId) {
        try {
            LogicielDTO logiciel = logicielClient.getLogicielById(logicielId);
            return logiciel != null ? logiciel.getNom() : "Logiciel inconnu";
        } catch (Exception e) {
            return "Logiciel inconnu";
        }
    }




}
