package ma.microservice.logiciel.services;

import jakarta.transaction.Transactional;
import ma.microservice.logiciel.entities.DemandeRenouvellement;
import ma.microservice.logiciel.entities.Licence;
import ma.microservice.logiciel.entities.Logiciel;
import ma.microservice.logiciel.feignClient.AffectationFiegnClient;
import ma.microservice.logiciel.feignClient.DepartementFeignClient;
import ma.microservice.logiciel.feignClient.EmployeFeignClient;
import ma.microservice.logiciel.feignClient.UserFeignClient;
import ma.microservice.logiciel.models.*;
import ma.microservice.logiciel.repositories.DemandeRenouvellementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class DemandeRenouvellementService {
    @Autowired
    private DemandeRenouvellementRepository repository;

    @Autowired
    private LicenceServices licenceService;
    @Autowired
    private EmployeFeignClient employeFeignClient;
    @Autowired
    private AffectationFiegnClient affectationClient;
    @Autowired
    private UserFeignClient userFeignClient;
    @Autowired
    private DepartementFeignClient departementFeignClient;
    @Autowired
    private JavaMailSender mailSender;

    public void sendNotificationEmail(String to, String subject, String text) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);
        mailSender.send(message);
    }


    public DemandeRenouvellement sauvegarder(DemandeRenouvellement demande) {
        return repository.save(demande);
    }

    public Optional<DemandeRenouvellement> findById(Long id) {
        return repository.findById(id);
    }

    public List<DemandeRenouvellement> findAll() {
        return repository.findAll();
    }

    public List<DemandeRenouvellement> findByLicenceId(Long licenceId) {
        return repository.findByLicenceId(licenceId);
    }

    public List<DemandeRenouvellement> findByDemandeurId(Long demandeurId) {
        return repository.findByDemandeurId(demandeurId);
    }

    public List<DemandeRenouvellement> findByStatut(String statut) {
        return repository.findByStatut(statut);
    }

    public List<DemandeRenouvellement> findPendingDemandes() {
        return repository.findByStatut("En attente");
    }

    @Transactional
    public DemandeRenouvellement approuverDemande(Long demandeId) {
        Optional<DemandeRenouvellement> optionalDemande = repository.findById(demandeId);
        if (optionalDemande.isPresent()) {
            DemandeRenouvellement demande = optionalDemande.get();
            // Mettre à jour le statut
            demande.setStatut("Acceptée");
            DemandeRenouvellement savedDemande = repository.save(demande);
            // Envoyer un email au demandeur
            envoyerEmailAcceptation(demande);

            return savedDemande;
        }
        return null;
    }

    private void envoyerEmailAcceptation(DemandeRenouvellement demande) {
        try {
            // Récupérer le demandeur
            UserDTO demandeur = userFeignClient.getUser(demande.getDemandeurId()).getBody();
            if (demandeur != null && demandeur.getUsername() != null) {
                String sujet = "[Licence] Votre demande de renouvellement a été approuvée";
                String message = String.format(
                        "Bonjour %s %s,\n\n" +
                                "Votre demande de renouvellement pour la licence \"%s\" (clé: %s) a été approuvée.\n\n" +
                                "Nouvelle date de fin : %s\n\n" +
                                "Merci de votre confiance.\n\n" +
                                "Cordialement,\nL'équipe de gestion des licences",
                        demandeur.getNom(),
                        demandeur.getPrenom(),
                        demande.getLicence().getLogiciel().getNom(),
                        demande.getLicence().getCleLicence(),
                        demande.getNouvelleDateFin()
                );

                sendNotificationEmail(demandeur.getUsername(), sujet, message);
            }
        } catch (Exception e) {
            System.err.println("Erreur lors de l'envoi de l'email d'acceptation : " + e.getMessage());
        }
    }

    @Transactional
    public DemandeRenouvellement rejeterDemande(Long demandeId, String motifRefus) {
        Optional<DemandeRenouvellement> optionalDemande = repository.findById(demandeId);
        if (optionalDemande.isPresent()) {
            DemandeRenouvellement demande = optionalDemande.get();
            demande.setStatut("Refusée");



            DemandeRenouvellement savedDemande = repository.save(demande);

            envoyerEmailRefus(demande, motifRefus);

            return savedDemande;
        }
        return null;
    }

    private void envoyerEmailRefus(DemandeRenouvellement demande, String motifRefus) {
        try {
            // Récupérer le demandeur
            UserDTO demandeur = userFeignClient.getUser(demande.getDemandeurId()).getBody();
            if (demandeur != null && demandeur.getUsername() != null) {
                String sujet = "[Licence] Votre demande de renouvellement a été refusée";
                String message = String.format(
                        "Bonjour %s %s,\n\n" +
                                "Votre demande de renouvellement pour la licence \"%s\" (clé: %s) a été refusée.\n\n" +
                                "Motif : %s\n\n" +
                                "Merci de contacter le service SI pour plus d'informations.\n\n" +
                                "Cordialement,\nL'équipe de gestion des licences",
                        demandeur.getNom(),
                        demandeur.getPrenom(),
                        demande.getLicence().getLogiciel().getNom(),
                        demande.getLicence().getCleLicence(),
                        motifRefus != null ? motifRefus : "Non spécifié"
                );

                sendNotificationEmail(demandeur.getUsername(), sujet, message);
            }
        } catch (Exception e) {
            System.err.println("Erreur lors de l'envoi de l'email de refus : " + e.getMessage());
        }
    }



    public void deleteDemande(Long id) {
        repository.deleteById(id);
    }


    public List<DemandeRenouvellementResponse> findAllEnrichi() {
        List<DemandeRenouvellement> demandes = repository.findAll();

        return demandes.stream().map(demande -> {
            DemandeRenouvellementResponse dto = new DemandeRenouvellementResponse();
            Licence licence = demande.getLicence();
            Logiciel logiciel = licence.getLogiciel();

            dto.setId(demande.getId());
            dto.setLicenceId(licence.getId());
            dto.setLogicielNom(logiciel != null ? logiciel.getNom() : "Inconnu");
            dto.setCleLicence(licence.getCleLicence());
            dto.setDateFinActuelle(licence.getDateFin());
            dto.setNouvelleDateFin(demande.getNouvelleDateFin());
            dto.setDateCreation(demande.getDateCreation());
            dto.setStatut(demande.getStatut());

            // === 1. Récupérer l'employé concerné (via microservice employé) ===
            Long employeConcerneId = getEmployeIdByLicenceId(licence.getId());
            if (employeConcerneId != null) {
                try {
                    EmployeDTO employe = employeFeignClient.getEmploye(employeConcerneId);
                    if (employe != null) {
                        dto.setEmployeConcerneNom(employe.getEmail());
                    } else {
                        dto.setEmployeConcerneNom("Employé non trouvé (ID: " + employeConcerneId + ")");
                    }
                } catch (Exception e) {
                    dto.setEmployeConcerneNom("Erreur service employé (ID: " + employeConcerneId + ")");
                    System.err.println("Erreur pour employé ID " + employeConcerneId + ": " + e.getMessage());
                }
            } else {
                dto.setEmployeConcerneNom("Non affecté");
            }

            // === 2. Récupérer le demandeur (UserDTO) + son département (nom) ===
            UserDTO demandeur = userFeignClient.getUser(demande.getDemandeurId()).getBody();
            if (demandeur != null ) {
                dto.setDemandeurNom(demandeur.getUsername());

                // Récupérer l'OBJET département complet, puis extraire le nom
                if (demandeur.getDepartmentId() != null) {
                    try {
                        DepartementDTO departement = departementFeignClient.getDepartementByID(demandeur.getDepartmentId()).getBody();
                        if (departement != null && departement.getNom() != null) {
                            dto.setDemandeurDepartement(departement.getNom());
                        } else {
                            dto.setDemandeurDepartement("Département inconnu");
                        }
                    } catch (Exception e) {
                        System.err.println("Erreur lors de la récupération du département ID: " + demandeur.getDepartmentId());
                        dto.setDemandeurDepartement("Département indisponible");
                    }
                } else {
                    dto.setDemandeurDepartement("Département non spécifié");
                }
            } else {
                dto.setDemandeurNom("Demandeur inconnu");
                dto.setDemandeurDepartement("Département inconnu");
            }

            return dto;
        }).collect(Collectors.toList());
    }

    private Long getEmployeIdByLicenceId(Long licenceId) {
        if (licenceId == null) {
            return null;
        }

        try {
            AffectationDTO affectation = affectationClient.getAffectationByLicenceId(licenceId).getBody();
            return affectation != null ? affectation.getEmployeId() : null;
        } catch (Exception e) {
            System.err.println("❌ Erreur appel microservice affectation pour licenceId=" + licenceId + ": " + e.getMessage());
            return null;
        }
    }





}
