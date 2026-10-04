package ma.microservice.logiciel.services;


import jakarta.transaction.Transactional;
import ma.microservice.logiciel.entities.Licence;
import ma.microservice.logiciel.entities.Logiciel;
import ma.microservice.logiciel.enumerated.StatutLicence;
import ma.microservice.logiciel.feignClient.DemandeClient;
import ma.microservice.logiciel.models.DemandeDTO;
import ma.microservice.logiciel.models.LogicielStatsDTO;
import ma.microservice.logiciel.repositories.LicenceRepository;
import ma.microservice.logiciel.repositories.LogicielRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
public class LogicielServices {
    @Autowired
    private LogicielRepository logicielRepository;
    @Autowired
    private LicenceRepository licenceRepository;
    @Autowired
    private LicenceServices licenceServices;
    @Autowired
    private DemandeClient demandeClient;

    public List<Logiciel> getLogiciels(){ return logicielRepository.findAll();}

    public Logiciel getLogicielById(Long id){return logicielRepository.findById(id).orElse(null);}

    public Logiciel existLogiciel(String nom, String version){return logicielRepository.findByNomAndVersion(nom,version);}

    public Logiciel addLogiciel(Logiciel logiciel){return logicielRepository.save(logiciel);}

    public Logiciel updateLogiciel(Logiciel existLogiciel, Logiciel newLogiciel){
        existLogiciel.setNom(newLogiciel.getNom());
        existLogiciel.setVersion(newLogiciel.getVersion());
        existLogiciel.setCategorie(newLogiciel.getCategorie());
        existLogiciel.setLicenceList(newLogiciel.getLicenceList());
        return logicielRepository.save(existLogiciel);
    }
    public void deleteLogiciel(Long id){
        logicielRepository.deleteById(id);
    }
    public Integer modifierNbrLicence(Long idlogiciel,Integer newnbrLicenceAjouter){
        Logiciel l = logicielRepository.findById(idlogiciel).orElse(null);
        if(l != null){
             newnbrLicenceAjouter += l.getNombreLicencesMax();
             l.setNombreLicencesMax(newnbrLicenceAjouter);
        }
        return l.getNombreLicencesMax();
    }







    public List<Licence> getLicencesOfLigiciel(Long id){
        Logiciel l = logicielRepository.findById(id).orElseThrow();
        return l.getLicenceList();

    }
    public List<Licence> getLicencesNoAffecterOfLigiciel(Long id){
        Logiciel l = logicielRepository.findById(id).orElseThrow();
        List<Licence> licenceList = l.getLicenceList();
        List<Licence> licenceListNoAffecter = new ArrayList<>();
        boolean estAffectee;
        for (Licence lic : licenceList) {
            estAffectee = licenceServices.estAffecte(lic.getId());
            if (!estAffectee) {
                licenceListNoAffecter.add(lic);
            }
        }
        return licenceListNoAffecter;
    }

    public Licence addLicenceToLogiciel(Long idLogiciel, Licence licence, Long demandeId ){
        Logiciel l = logicielRepository.findById(idLogiciel).orElseThrow();
        licence.setLogiciel(l);
        licence.setDemandeId(demandeId);
        licence.setDateAchat(LocalDate.now());
        // ✅ DEBUG : LOG ici
        System.out.println("=== AVANT SAVE ===");
        System.out.println("Licence ID: " + licence.getId());
        System.out.println("Date achat: " + licence.getDateAchat());
        System.out.println("Prix: " + licence.getPrix());
        System.out.println("Demande ID: " + licence.getDemandeId());
        Licence savedLicence = licenceRepository.save(licence);
        // ✅ DEBUG : LOG après save
        System.out.println("=== APRÈS SAVE ===");
        System.out.println("Saved Licence ID: " + savedLicence.getId());
        System.out.println("Saved Date achat: " + savedLicence.getDateAchat());
        l.getLicenceList().add(licence);
        logicielRepository.save(l);
        return savedLicence;

    }

    @Transactional
    public Map<String, Object> createMultipleLicences(Long logicielId, List<Licence> licences) {
        // 1. Vérifier que le logiciel existe
        Logiciel logiciel = logicielRepository.findById(logicielId)
                .orElseThrow(() -> new RuntimeException("Logiciel non trouvé avec l'ID : " + logicielId));

        // 2. Vérifier qu'il y a au moins une licence
        if (licences.isEmpty()) {
            return Map.of("success", false, "message", "Aucune licence fournie.");
        }

        Long demandeId = licences.get(0).getDemandeId();
        if (demandeId == null) {
            return Map.of("success", false, "message", "L'ID de la demande est requis pour créer un paquet.");
        }

        // 3. Appeler le microservice "demande" pour obtenir nbLicences
        DemandeDTO demande = demandeClient.getDemandeById(demandeId);

        if (demande == null || demande.getNbLicences() == null) {
            return Map.of(
                    "success", false,
                    "message", "Demande non trouvée ou invalide : " + demandeId
            );
        }

        int nbLicencesDemandees = demande.getNbLicences();

        // 4. Compter les licences déjà créées pour cette demande
        int licencesCrees = licenceRepository.countByDemandeId(demandeId);
        int totalToAdd = licences.size();
        int remaining = nbLicencesDemandees - licencesCrees;

        // 5. Vérifier la limite
        if (totalToAdd > remaining) {
            return Map.of(
                    "success", false,
                    "message", "Impossible de créer " + totalToAdd + " licences. Seules " + remaining + " sont disponibles selon la demande."
            );
        }

        // 6. Créer chaque licence ET récupérer les entités sauvegardées
        List<Licence> licencesSauvegardees = new ArrayList<>();

        for (Licence l : licences) {
            l.setLogiciel(logiciel);
            l.setDemandeId(demandeId);
            l.setDateAchat(LocalDate.now());

            Licence saved = licenceRepository.save(l); // ← Récupère la licence sauvegardée avec ID
            licencesSauvegardees.add(saved);           // ← Stocke-la
        }

        // 7. Retourner succès + les licences créées
        return Map.of(
                "success", true,
                "message", "Paquet de " + totalToAdd + " licences créé avec succès.",
                "createdCount", totalToAdd,
                "licences", licencesSauvegardees //  IMPORTANT : Angular en a besoin pour l'affectation
        );
    }

    public Licence updateLicenceOfLogiciel(Long idExistLicence, Licence newlicence){
        Licence existlicence = licenceRepository.findById(idExistLicence).orElseThrow();
        existlicence.setCleLicence(newlicence.getCleLicence());
        existlicence.setPrix(newlicence.getPrix());
        existlicence.setDateFin(newlicence.getDateFin());
        existlicence.setDateDebut(newlicence.getDateDebut());
        existlicence.setStatut(newlicence.getStatut());
        return licenceRepository.save(existlicence);
    }

    public void deleteLicenceOfLogiciel(Logiciel logiciel, Licence licence){
        logiciel.getLicenceList().remove(licence);
        licence.setLogiciel(null);
        licenceRepository.deleteById(licence.getId());
    }
    public void disableStatusOfLicence(Licence licence){
        licence.setStatut(StatutLicence.EXPIRED);
    }

    public long conterLogiciel(){
        return logicielRepository.count();
    }


    public List<LogicielStatsDTO> getTop5Logiciels() {
        return logicielRepository.findTop5ByNombreLicences().stream()
                .limit(5)
                .collect(Collectors.toList());
    }






}
