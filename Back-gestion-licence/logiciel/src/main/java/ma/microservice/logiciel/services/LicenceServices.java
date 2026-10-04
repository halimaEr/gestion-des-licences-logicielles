package ma.microservice.logiciel.services;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import ma.microservice.logiciel.entities.Licence;
import ma.microservice.logiciel.enumerated.StatutLicence;
import ma.microservice.logiciel.feignClient.*;
import ma.microservice.logiciel.models.*;
import ma.microservice.logiciel.repositories.LicenceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@Transactional
public class LicenceServices {
    @Autowired
    private LicenceRepository licenceRepository;
    @Autowired
    private AffectationFiegnClient affectationFiegnClient;
    @Autowired
    private EmployeFeignClient employeFeignClient;
    @Autowired
    private UserFeignClient userFeignClient;
    @Autowired
    private JavaMailSender mailSender;
    @Autowired
    private DepartementFeignClient departementFeignClient;
    @Autowired
    private DemandeClient demandeClient;

    public List<Licence> getAllLicences() {
        return licenceRepository.findAll();
    }

    public Licence getLicenceById(Long id) {
        return licenceRepository.findById(id).orElse(null);
    }

    public Licence getLicenceByCleLicence(String cle) {
        return licenceRepository.findByCleLicence(cle);
    }

    public Licence creeLicence(Licence licence) {
        return licenceRepository.save(licence);
    }

    public Licence updateLicence(Licence existLicence, Licence newLicence) {
        existLicence.setCleLicence(newLicence.getCleLicence());
        existLicence.setPrix(newLicence.getPrix());
        existLicence.setDateDebut(newLicence.getDateDebut());
        existLicence.setDateFin(newLicence.getDateFin());
        existLicence.setStatut(newLicence.getStatut());
        existLicence.setLogiciel(newLicence.getLogiciel());
        return licenceRepository.save(existLicence);
    }

    public boolean estAffecte(Long licenceId) {
        return affectationFiegnClient.estLicenceAffectee(licenceId);

    }

    public void deleteLicence(Long id) {
        licenceRepository.deleteById(id);
    }

    public List<Licence> getLicencesActive() {
        return licenceRepository.findByStatut(StatutLicence.ACTIVE);
    }

    public List<Licence> getLicencesExpirer() {
        return licenceRepository.findByStatut(StatutLicence.EXPIRED);
    }
    public List<Licence> getLicencesLibres() {
        return licenceRepository.findByStatut(StatutLicence.LIBEREE);
    }
    public long conterLicences() {
        return licenceRepository.count();
    }

    public void renouvlerLicence(Licence licence, LocalDate dateFin) {
        licence.setDateFin(dateFin);
        licence.setStatut(StatutLicence.ACTIVE);
    }

    public List<Licence> getLicencesExpiringSoon() {
        LocalDate now = LocalDate.now();
        LocalDate in30Days = now.plusDays(30);

        return licenceRepository.findByDateFinBetween(now, in30Days);
    }


    public void verifierEtMettreAJourLicences() {
        LocalDate aujourdhui = LocalDate.now();
        licenceRepository.mettreAJourStatutLicences(
                StatutLicence.ACTIVE,
                StatutLicence.EXPIRED,
                aujourdhui
        );
        System.out.println("Mise à jour des licences expirées terminée pour : " + aujourdhui);
    }

    // Méthode pour récupérer toutes les licences par ID de demande
    public List<Licence> getLicencesByDemandeId(Long demandeId) {
        return licenceRepository.findByDemandeId(demandeId);
    }


    public List<LicenceDetailDTO> getLicencesParDepartement(Long departmentId) {
            // Récupérer tous les employés du département
            List<EmployeDTO> employes = employeFeignClient.getEmployesByDepartementId(departmentId);
            if (employes == null || employes.isEmpty()) {
                return Collections.emptyList();
            }

            // Map employé par ID pour accès rapide
            Map<Long, EmployeDTO> employeMap = employes.stream()
                    .filter(e -> e.getId() != null)
                    .collect(Collectors.toMap(EmployeDTO::getId, e -> e));

            List<Long> employeIds = new ArrayList<>(employeMap.keySet());

            // Récupérer les affectations pour ces employés
            List<AffectationDTO> affectations = affectationFiegnClient.getByEmployeIds(employeIds);
            if (affectations == null || affectations.isEmpty()) {
                return Collections.emptyList();
            }

            // Extraire les licences
            List<Long> licenceIds = affectations.stream()
                    .map(AffectationDTO::getLicenceId)
                    .filter(Objects::nonNull)
                    .distinct()
                    .toList();

            List<Licence> licences = licenceRepository.findAllById(licenceIds);
            licences.forEach(this::verifierEtMettreAJourStatut);

            //Construire la liste finale en respectant ton DTO
            return affectations.stream()
                    .map(aff -> {
                        Licence licence = licences.stream()
                                .filter(l -> l.getId().equals(aff.getLicenceId()))
                                .findFirst()
                                .orElse(null);

                        EmployeDTO emp = employeMap.get(aff.getEmployeId());

                        if (licence != null && emp != null) {
                            LicenceDetailDTO dto = new LicenceDetailDTO();
                            dto.setLicenceId(licence.getId());
                            dto.setLogicielNom(licence.getLogiciel().getNom());
                            dto.setCategorieLogiciel(licence.getLogiciel().getCategorie());
                            dto.setVesrionLogiciel(licence.getLogiciel().getVersion());
                            dto.setCleLicence(licence.getCleLicence());
                            dto.setPrix(licence.getPrix());
                            dto.setDateDebut(licence.getDateDebut());
                            dto.setDateFin(licence.getDateFin());
                            dto.setStatut(licence.getStatut());
                            dto.setNom(emp.getNom());
                            dto.setPrenom(emp.getPrenom());
                            dto.setEmail(emp.getEmail());
                            return dto;
                        }

                        return null;
                    })
                    .filter(Objects::nonNull)
                    .toList();
        }

    public void sendNotificationEmail(String to, String subject, String text) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);
        mailSender.send(message);
    }


@Scheduled(cron = "0 0 8 * * *")
public void verifierLicencesExpirations() {
        LocalDate today = LocalDate.now();

        List<Licence> licences = licenceRepository.findAll();
        Map<String, List<Licence>> groupes = new HashMap<>();

        for (Licence lic : licences) {
            LocalDate dateFin = lic.getDateFin();
            if (dateFin == null) continue;

            long daysLeft = ChronoUnit.DAYS.between(today, dateFin);
            if (daysLeft < 0 || daysLeft > 3) continue;

            if (lic.getDateExpiration() != null && lic.getDateExpiration().isEqual(dateFin)) {
                continue;
            }

            ResponseEntity<AffectationDTO> affResp = affectationFiegnClient.getAffectationByLicenceId(lic.getId());
            if (affResp == null || !affResp.hasBody()) continue;

            AffectationDTO affectation = affResp.getBody();
            if (affectation == null || affectation.getEmployeId() == null) continue;

            Optional<EmployeDTO> empResp = employeFeignClient.getEmployeById(affectation.getEmployeId());
            if (empResp.isEmpty()) continue;

            EmployeDTO employe = empResp.get();

            String logicielNom = lic.getLogiciel() != null ? lic.getLogiciel().getNom() : "—";
            String key = logicielNom + "|" + dateFin.toString();

            groupes.computeIfAbsent(key, k -> new ArrayList<>()).add(lic);
        }

        // Récupérer gestionnaire unique
        ResponseEntity<UserDTO> resp = userFeignClient.getGestionnaire();
        if (resp == null || !resp.hasBody() || resp.getBody() == null) {
            throw new RuntimeException("Aucun gestionnaire trouvé !");
        }
        UserDTO gestionnaire = resp.getBody();


        for (Map.Entry<String, List<Licence>> entry : groupes.entrySet()) {
            List<Licence> groupeLicences = entry.getValue();
            if (groupeLicences.isEmpty()) continue;

            Licence firstLic = groupeLicences.get(0);
            LocalDate dateFin = firstLic.getDateFin();
            String logicielNom = firstLic.getLogiciel() != null ? firstLic.getLogiciel().getNom() : "—";

            StringBuilder corps = new StringBuilder();
            corps.append(String.format("Bonjour %s %s,\n\n", gestionnaire.getPrenom(), gestionnaire.getNom()));
            corps.append(String.format(
                    "La licence %s expirera le %s pour les employés suivants :\n\n",
                    logicielNom,
                    dateFin.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))));

            for (Licence lic : groupeLicences) {
                ResponseEntity<AffectationDTO> aff = affectationFiegnClient.getAffectationByLicenceId(lic.getId());
                if (aff == null || !aff.hasBody()) continue;
                AffectationDTO affDto = aff.getBody();
                if (affDto == null || affDto.getEmployeId() == null) continue;

                Optional<EmployeDTO> emp = employeFeignClient.getEmployeById(affDto.getEmployeId());
                if (emp.isEmpty()) continue;
                EmployeDTO empDto = emp.get();

                // Récupérer le département
                ResponseEntity<DepartementDTO> depResp = departementFeignClient.getDepartementByID(empDto.getDepartementId());
                String depNom = (depResp != null && depResp.hasBody()) ? depResp.getBody().getNom() : "—";

                corps.append(String.format("- %s %s (Département: %s)\n",
                        empDto.getNom(), empDto.getPrenom(), depNom));
            }

            corps.append("\nVeuillez vous connecter à l’application pour renouveler la licence.\n\nMerci.");

            sendNotificationEmail(
                    gestionnaire.getUsername(),
                    "Alerte : Licences expirant bientôt",
                    corps.toString()
            );

            // Marquer chaque licence comme notifiée
            for (Licence lic : groupeLicences) {
                LocalDate ld = lic.getDateFin();
                lic.setDateExpiration(ld);
                licenceRepository.save(lic);
            }
        }
    }



    public List<Licence> getLicencesNoAffecter () {
        List<Licence> licenceList = this.getAllLicences();
        List<Licence> licenceListNoAffecter = new ArrayList<>();
        boolean estAffectee;
        for (Licence l : licenceList) {
            estAffectee = estAffecte(l.getId());
            if (!estAffectee) {
                licenceListNoAffecter.add(l);
            }
        }
        return licenceListNoAffecter;
    }

    private void verifierEtMettreAJourStatut(Licence licence) {
        if (licence.getDateFin() != null &&
                licence.getDateFin().isBefore(LocalDate.now()) &&
                licence.getStatut() != StatutLicence.EXPIRED) {

            licence.setStatut(StatutLicence.EXPIRED);
            licenceRepository.save(licence);
        }}


        public List<DepartementStatsDTO> getStatsByDepartement () {
            List<AffectationDTO> affectations = affectationFiegnClient.getAllAffectations();

            Map<String, DepartementStatsDTO> stats = new HashMap<>();

            for (AffectationDTO a : affectations) {
                // === Récupérer l'employé ===
                Optional<EmployeDTO> employeOpt = employeFeignClient.getEmployeById(a.getEmployeId());
                if (employeOpt.isEmpty()) {
                    continue; // employé inexistant
                }

                EmployeDTO employe = employeOpt.get();

                // === Récupérer le nom du département ===
                String depNom = "Inconnu";
                if (employe.getDepartementId() != null) {
                    DepartementDTO dep = departementFeignClient.getDepartementByID(employe.getDepartementId()).getBody();
                    if (dep != null && dep.getNom() != null) {
                        depNom = dep.getNom();
                    }
                }

                // === Récupérer ou initialiser le DTO du département ===
                DepartementStatsDTO dto = stats.computeIfAbsent(depNom,
                        key -> new DepartementStatsDTO(key, 0L, 0.0));

                // === Incrémenter le nombre de licences ===
                dto.setNombreLicences(dto.getNombreLicences() + 1);

                // === Récupérer la licence et ajouter le coût ===
                if (a.getLicenceId() != null) {
                    Optional<Licence> licenceOpt = licenceRepository.findById(a.getLicenceId());
                    if (licenceOpt.isPresent()) {
                        Licence licence = licenceOpt.get();
                        dto.setCoutTotal(dto.getCoutTotal() + licence.getPrix());

                    }
                }
            }

            return new ArrayList<>(stats.values());
        }


        public Licence libererLicence (Long licenceId){
            Licence licence = licenceRepository.findById(licenceId)
                    .orElseThrow(() -> new RuntimeException("Licence introuvable"));

            licence.setStatut(StatutLicence.LIBEREE);
            return licenceRepository.save(licence);
        }

    public List<CoutsDepartementDTO> getCoutsParDepartementParAnnee(Integer annee) {
        if (annee == null) return new ArrayList<>();

        LocalDate debut = LocalDate.of(annee, 1, 1);
        LocalDate fin = LocalDate.of(annee, 12, 31);

        // Étape 1 : Récupérer TOUTES les licences achetées dans l'année
        List<Licence> licencesAchetees = licenceRepository.findByDateAchatBetween(debut, fin);
        if (licencesAchetees == null || licencesAchetees.isEmpty()) {
            return new ArrayList<>();
        }

        return licencesAchetees.parallelStream()
                .map(licence -> {
                    try {
                        // Département par défaut
                        String departementNom = "Non affecté";
                        double prix = licence.getPrix();
                        // Étape 2 : Remonter via demandeId → responsable → département
                        Long demandeId = licence.getDemandeId();
                        if (demandeId != null) {
                            // Appel Feign pour récupérer la demande
                            DemandeDTO demande = demandeClient.getDemandeById(demandeId);
                            if (demande != null && demande.getResponsableId() != null) {
                                // Appel Feign pour récupérer le responsable
                                UserDTO responsable = userFeignClient.getUser(demande.getResponsableId()).getBody();
                                if (responsable != null && responsable.getDepartmentId() != null) {
                                    // Appel Feign pour récupérer le département
                                    DepartementDTO dept = departementFeignClient.getDepartement(responsable.getDepartmentId());
                                    if (dept != null) {
                                        departementNom = dept.getNom();
                                    }
                                }
                            }
                        }

                        // Coût total = prix de la licence (toujours, car achetée dans l'année)
                        double coutTotal = prix;

                        // Coût consommé = 0 si statut == LIBEREE
                        double coutConsomme = (licence.getStatut() != null &&
                                licence.getStatut() != StatutLicence.LIBEREE) ? prix : 0.0;

                        return new CoutsDepartementDTO(departementNom, coutTotal, coutConsomme);

                    } catch (Exception e) {
                        System.err.println("Erreur traitement licence ID: " + licence.getId() + " - " + e.getMessage());
                        return null;
                    }
                })
                .filter(Objects::nonNull)
                .collect(Collectors.groupingBy(
                        CoutsDepartementDTO::getDepartementNom,
                        Collectors.reducing(
                                new CoutsDepartementDTO("", 0.0, 0.0),
                                (dto1, dto2) -> new CoutsDepartementDTO(
                                        dto2.getDepartementNom(),
                                        dto1.getCoutTotal() + dto2.getCoutTotal(),
                                        dto1.getCoutConsomme() + dto2.getCoutConsomme()
                                )
                        )
                ))
                .values()
                .stream()
                .sorted((a, b) -> Double.compare(b.getCoutTotal(), a.getCoutTotal()))
                .collect(Collectors.toList());
    }


    public List<CoutsLogicielDTO> getCoutsParLogicielParAnneeEtDepartement(Integer annee, Long departementId) {
        if (annee == null) return new ArrayList<>();

        LocalDate debut = LocalDate.of(annee, 1, 1);
        LocalDate fin = LocalDate.of(annee, 12, 31);

        // Étape 1 : Récupérer TOUTES les licences achetées dans l'année
        List<Licence> licencesAchetees = licenceRepository.findByDateAchatBetween(debut, fin);
        if (licencesAchetees == null || licencesAchetees.isEmpty()) {
            return new ArrayList<>();
        }

        // Étape 2 : Si un département est spécifié, filtrer les licences dont le responsable appartient à ce département
        Stream<Licence> stream = licencesAchetees.stream();

        if (departementId != null) {
            stream = stream.filter(licence -> {
                try {
                    Long demandeId = licence.getDemandeId();
                    if (demandeId == null) return false;

                    DemandeDTO demande = demandeClient.getDemandeById(demandeId);
                    if (demande == null || demande.getResponsableId() == null) return false;

                    UserDTO responsable = userFeignClient.getUser(demande.getResponsableId()).getBody();
                    if (responsable == null || responsable.getDepartmentId() == null) return false;

                    return responsable.getDepartmentId().equals(departementId);

                } catch (Exception e) {
                    System.err.println("Erreur filtrage licence ID: " + licence.getId() + " pour département " + departementId);
                    return false;
                }
            });
        }

        // Étape 3 : Mapper chaque licence en CoutsLogicielDTO
        return stream
                .map(licence -> {
                    try {
                        String nomLogiciel = licence.getLogiciel() != null ? licence.getLogiciel().getNom() : "Inconnu";
                        double prix = licence.getPrix();
                        double coutTotal = prix;
                        double coutConsomme = (licence.getStatut() != null &&
                                licence.getStatut() != StatutLicence.LIBEREE) ? prix : 0.0;

                        return new CoutsLogicielDTO(nomLogiciel, coutTotal, coutConsomme);

                    } catch (Exception e) {
                        System.err.println("Erreur traitement licence ID: " + licence.getId());
                        return null;
                    }
                })
                .filter(Objects::nonNull)
                .collect(Collectors.groupingBy(
                        CoutsLogicielDTO::getNomLogiciel,
                        Collectors.reducing(
                                new CoutsLogicielDTO("", 0.0, 0.0),
                                (dto1, dto2) -> new CoutsLogicielDTO(
                                        dto2.getNomLogiciel(),
                                        dto1.getCoutTotal() + dto2.getCoutTotal(),
                                        dto1.getCoutConsomme() + dto2.getCoutConsomme()
                                )
                        )
                ))
                .values()
                .stream()
                .sorted((a, b) -> Double.compare(b.getCoutTotal(), a.getCoutTotal()))
                .collect(Collectors.toList());
    }


        public List<EmployeUtilisationDTO> getDetailsLogiciel (String nomLogiciel, Integer annee, Long departementId){
            LocalDate debut = LocalDate.of(annee, 1, 1);
            LocalDate fin = LocalDate.of(annee, 12, 31);

            // 1. Récupérer les affectations dans l'année
            List<AffectationDTO> affectations;
            try {
                affectations = affectationFiegnClient.getAffectationsParDate(debut, fin);
                if (affectations == null || affectations.isEmpty()) {
                    return new ArrayList<>();
                }
            } catch (Exception e) {
                return new ArrayList<>();
            }

            // 2. Filtrer par département (si spécifié)
            Set<Long> employeIdsDuDept = new HashSet<>();
            if (departementId != null) {
                try {
                    List<EmployeDTO> employes = employeFeignClient.getEmployesByDepartementId(departementId);
                    employeIdsDuDept.addAll(employes.stream().map(EmployeDTO::getId).collect(Collectors.toSet()));
                } catch (Exception e) {
                    // Si erreur, on continue sans filtre
                }
            }

            return affectations.stream()
                    .filter(affectation -> {
                        // Filtrer par logiciel
                        try {
                            Optional<Licence> licenceOpt = licenceRepository.findById(affectation.getLicenceId());
                            return licenceOpt.isPresent() &&
                                    licenceOpt.get().getLogiciel().getNom().equalsIgnoreCase(nomLogiciel);
                        } catch (Exception e) {
                            return false;
                        }
                    })
                    .filter(affectation ->
                            departementId == null ||
                                    employeIdsDuDept.contains(affectation.getEmployeId())
                    )
                    .map(affectation -> {
                        try {
                            // Récupérer l'employé
                            EmployeDTO emp = employeFeignClient.getEmploye(affectation.getEmployeId());
                            String nomComplet = emp.getNom() + " " + emp.getPrenom();

                            // Récupérer la licence
                            Licence licence = licenceRepository.findById(affectation.getLicenceId())
                                    .orElseThrow(() -> new RuntimeException("Licence non trouvée"));

                            // Récupérer la date de demande via demandeId
                            String dateDemandeStr = null;
                            if (licence.getDemandeId() != null) {
                                DemandeDTO demande = demandeClient.getDemandeById(licence.getDemandeId());
                                if (demande != null && demande.getDate() != null) {
                                    dateDemandeStr = demande.getDate().toString(); // "2024-03-15"
                                }
                            }

                            // Date d'affectation
                            String dateAffectationStr = affectation.getDateAffectation().toString();

                            return new EmployeUtilisationDTO(nomComplet, dateAffectationStr, dateDemandeStr);

                        } catch (Exception e) {
                            return null;
                        }
                    })
                    .filter(Objects::nonNull)
                    .sorted((a, b) -> b.getDateAffectation().compareTo(a.getDateAffectation())) // tri décroissant
                    .collect(Collectors.toList());
        }


    }






