package org.example.affectationservice.service;

import org.example.affectationservice.dto.AffectationLicenceDetailDTO;
import org.example.affectationservice.dto.EmployeDTO;
import org.example.affectationservice.dto.LicenceDTO;
import org.example.affectationservice.feignclients.EmployeClient;
import org.example.affectationservice.feignclients.LicenceClient;
import org.example.affectationservice.model.AffectationLicence;
import org.example.affectationservice.repository.AffectationRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AffectationService {

    public AffectationService(AffectationRepository affectationRepository, EmployeClient employeClient, LicenceClient licenceClient) {
        this.affectationRepository = affectationRepository;
        this.employeClient = employeClient;
        this.licenceClient = licenceClient;
    }

    private final AffectationRepository affectationRepository;
    private final EmployeClient employeClient;
    private final LicenceClient licenceClient;


    public ResponseEntity<?> affecterLicence(@RequestBody AffectationLicence request) {
        Long employeId = request.getEmployeId();
        Long licenceId = request.getLicenceId();
        Optional<EmployeDTO> emp = employeClient.getEmployeById(employeId);
        LicenceDTO lic = licenceClient.getLicences(licenceId);
        if (emp.isEmpty() || lic == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                            "success", false,
                            "message", "Employé ou licence introuvable "
                    ));
        }
        Optional<AffectationLicence> existante = affectationRepository.findByEmployeIdAndLicenceId(employeId, licenceId);

        if (existante.isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of(
                            "success", false,
                            "message", "Cette licence est déjà affectée à cet employé"
                    ));
        }
        AffectationLicence affectation = new AffectationLicence();
        affectation.setEmployeId(employeId);
        affectation.setLicenceId(licenceId);
        affectation.setDateAffectation(LocalDate.now());
        affectationRepository.save(affectation);
        return ResponseEntity.status(HttpStatus.OK)
                .body(Map.of(
                        "success", true,
                        "message", "Licence affectée avec succès"
                ));
    }

    public boolean estLicenceAffectee(Long licenceId) {
        return !affectationRepository.findByLicenceId(licenceId).isEmpty();
    }

    // Dans AffectationService
    public Optional<AffectationLicence> findFirstInYear(Long licenceId, LocalDate debut, LocalDate fin) {
        return affectationRepository
                .findFirstByLicenceIdAndDateAffectationBetweenOrderByDateAffectationAsc(
                        licenceId, debut, fin);
    }
    public ResponseEntity<?> supprimerAffectation(Long employeId, Long licenceId) {
        Optional<AffectationLicence> affectationOpt = affectationRepository.findByEmployeIdAndLicenceId(employeId, licenceId);
        if (affectationOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                            "success", false,
                            "message", "Aucune affectation trouvée pour cet employé et cette licence "
                    ));
        }
        affectationRepository.delete(affectationOpt.get());
        // Libérer la licence (changer son statut à LIBEREE)
        try {
            // Appeler le service licence pour libérer la licence
            licenceClient.libererLicence(licenceId);
        } catch (Exception e) {
            System.err.println("Erreur lors de la libération de la licence: " + e.getMessage());
            // Vous pouvez choisir de continuer ou de retourner une erreur
        }

        return ResponseEntity.status(HttpStatus.OK)
                .body(Map.of(
                        "success", true,
                        "message", "Affectation supprimée avec succès "
                ));

    }

    public List<AffectationLicence> getByEmployeIds(List<Long> employeIds) {
        return affectationRepository.findByEmployeIdIn(employeIds);
    }

    public AffectationLicence getAffectationByLicenceId(Long licenceId) {
        List<AffectationLicence> affectations = affectationRepository.findByLicenceId(licenceId);
        if (affectations.isEmpty()) {
            throw new RuntimeException("Aucune affectation trouvée pour la licence ID : " + licenceId);
        }
        return affectations.get(0);
    }


    public List<AffectationLicence> getAllLicenceOfEmploye(Long idEmpl){
        return this.affectationRepository.findByEmployeId(idEmpl);
    }


    public List<AffectationLicenceDetailDTO> getLicencesDetailsByEmployeId(Long employeId) {
        List<AffectationLicence> affectations = affectationRepository.findByEmployeId(employeId);

        return affectations.stream().map(affect -> {
            try {
                LicenceDTO licenceDTO = licenceClient.getLicences(affect.getLicenceId());

                if (licenceDTO != null) {
                    return new AffectationLicenceDetailDTO(
                            affect.getDateAffectation(),
                            affect.getLicenceId(),           // ← On passe l'ID de la licence
                            licenceDTO.getCleLicence(),
                            licenceDTO.getLogiciel().getNom()
                    );
                } else {
                    return new AffectationLicenceDetailDTO(
                            affect.getDateAffectation(),
                            affect.getLicenceId(),           // Même si licenceDTO est null, on a l'ID depuis l'affectation
                            "Clé non disponible",
                            "Erreur"
                    );
                }
            } catch (Exception e) {
                System.err.println("Erreur lors de la récupération de la licence ID " + affect.getLicenceId() + " : " + e.getMessage());
                return new AffectationLicenceDetailDTO(
                        affect.getDateAffectation(),
                        affect.getLicenceId(),               // On garde l'ID malgré l'erreur
                        "Erreur de chargement",
                       "Erreur"
                );
            }
        }).collect(Collectors.toList());
    }
    public List<AffectationLicence> getAllAffectations(){
        return affectationRepository.findAll();
    }
    public List<AffectationLicence> getAffectationsParDate(LocalDate debut, LocalDate fin) {
        return affectationRepository.findByDateAffectationBetween(debut, fin);
    }
    public List<Long> getEmployeIdsWithLicences() {
        return affectationRepository.findDistinctEmployeIds();
    }

}
