package org.example.serviceauthentication.service;

import org.example.serviceauthentication.dto.DepartmentDto;
import org.example.serviceauthentication.enumeration.Role;
import org.example.serviceauthentication.feignclients.DepartmentService;
import org.example.serviceauthentication.model.User;
import org.example.serviceauthentication.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class AuthenticationService {
    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private DepartmentService departmentService;

    public static final Long UNASSIGNED_DEPARTMENT = -1L;

    private final AuthenticationManager authenticationManager;

    public AuthenticationService(UserRepository repository,
                                 PasswordEncoder passwordEncoder,
                                 JwtService jwtService, DepartmentService departmentService,
                                 AuthenticationManager authenticationManager

    ) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.departmentService = departmentService;
        this.authenticationManager = authenticationManager;

    }

    public String register(User request) {
        if (repository.findByUsername(request.getUsername()).isPresent()) {
            throw new IllegalArgumentException("Ce nom d'utilisateur est déjà utilisé. Veuillez en choisir un autre");
        }

        Long departmentId;

        if (request.getRole() == Role.Responsable) {
            if (request.getDepartementName() == null || request.getDepartementName().isEmpty()) {
                throw new IllegalArgumentException("Un responsable doit être affecté à un département valide.");
            }

            // Appel au microservice pour récupérer l'ID du département
            ResponseEntity<DepartmentDto> response;
            try {
                response = departmentService.getDepartementByNom(request.getDepartementName());
            } catch (Exception e) {
                throw new IllegalArgumentException("Impossible de contacter le service des départements. Réessayez plus tard.");
            }

            if (response.getStatusCode() != HttpStatus.OK || response.getBody() == null) {
                throw new IllegalArgumentException("Le département spécifié n'existe pas.");
            }

            departmentId = response.getBody().getId();

            // Vérifier uniquement s'il y a déjà un RESPONSABLE dans ce département
            boolean responsableExists = repository.findByRole(Role.Responsable)
                    .stream()
                    .anyMatch(u -> u.getDepartmentId().equals(departmentId));

            if (responsableExists) {
                throw new IllegalArgumentException("Ce département a déjà un responsable.");
            }

        } else {
            // Si ce n’est pas un Responsable, affectation automatique au département "SI"
            ResponseEntity<DepartmentDto> siResponse;
            try {
                siResponse = departmentService.getDepartementByNom("SI");
            } catch (Exception e) {
                throw new IllegalArgumentException("Erreur lors de l'affectation au département SI.");
            }

            if (siResponse.getStatusCode() != HttpStatus.OK || siResponse.getBody() == null) {
                throw new IllegalArgumentException("Le département 'SI' est introuvable.");
            }

            departmentId = siResponse.getBody().getId();
        }

        // Création de l'utilisateur
        User user = new User();
        user.setPrenom(request.getPrenom());
        user.setNom(request.getNom());
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        user.setDepartmentId(departmentId);

        repository.save(user);
        return "Inscription réussie !";
    }

    public Map<String, Object> authenticate(User request) { // Change le type de retour
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword()
                    )
            );
            User user = repository.findByUsername(request.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found after successful authentication"));
            String token = jwtService.generateToken(user);
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            Map<String, Object> userDetails = new HashMap<>();
            userDetails.put("id", user.getId());
            userDetails.put("prenom", user.getPrenom()); // Prénom
            userDetails.put("nom", user.getNom());       // Nom
            userDetails.put("username", user.getUsername());
            userDetails.put("role", user.getRole().name()); // Convertit l'enum en String
            response.put("user", userDetails); // Ajoute l'objet utilisateur à la réponse
            return response;
        } catch (BadCredentialsException ex) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "username or password are incorrect");
            return errorResponse;
        } catch (UsernameNotFoundException ex) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "password or username are incorrect");
            return errorResponse;
        } catch (Exception ex) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error: Authentication failed - " + ex.getMessage());
            return errorResponse;
        }
    }

    public User getUserFromToken(String token) {
        String username = jwtService.extractUsername(token);
        Optional<User> userOptional = repository.findByUsername(username);

        if (userOptional.isPresent()) {
            return userOptional.get();
        } else {
            throw new UsernameNotFoundException("User not found with username: " + username);
        }
    }

    public Optional<User> getUserById(Long id){
        return repository.findById(id);
    }


    public String DeleteUser(Long id){
        Optional<User> userOptional= repository.findById(id);
        if(userOptional.isEmpty()){
            return "Aucun utilisateur trouvé avec cet Id";
        }
        User user = userOptional.get();
        repository.delete(user);

        return "Utilisateur " + user.getUsername() + " supprimé avec succès.";

    }


    public String updateUser(Long userId, User updatedUser) {
        Optional<User> userOptional = repository.findById(userId);
        if (userOptional.isEmpty()) {
            return "Aucun utilisateur trouvé avec cet ID.";
        }

        User existingUser = userOptional.get();

        // Vérification si le username est déjà utilisé par un autre utilisateur
        Optional<User> userWithSameUsername = repository.findByUsername(updatedUser.getUsername());
        if (userWithSameUsername.isPresent() && !userWithSameUsername.get().getId().equals(userId)) {
            throw new IllegalArgumentException("Ce nom d'utilisateur est déjà utilisé. Veuillez en choisir un autre.");
        }

        Long departmentId = existingUser.getDepartmentId(); // Valeur par défaut
        Role newRole = updatedUser.getRole();

        if (newRole == Role.Responsable) {
            if (updatedUser.getDepartementName() == null || updatedUser.getDepartementName().isEmpty()) {
                throw new IllegalArgumentException("Un responsable doit être affecté à un département valide.");
            }

            ResponseEntity<DepartmentDto> response;
            try {
                response = departmentService.getDepartementByNom(updatedUser.getDepartementName());
            } catch (Exception e) {
                throw new IllegalArgumentException("Impossible de contacter le service des départements. Réessayez plus tard.");
            }

            if (response.getStatusCode() != HttpStatus.OK || response.getBody() == null) {
                throw new IllegalArgumentException("Le département spécifié n'existe pas.");
            }

            Long newDepartmentId = response.getBody().getId();

            // Vérifier uniquement s'il y a déjà un RESPONSABLE dans ce département autre que l'utilisateur actuel
            boolean responsableExists = repository.findByRole(Role.Responsable)
                    .stream()
                    .anyMatch(u -> !u.getId().equals(userId) && u.getDepartmentId().equals(newDepartmentId));

            if (responsableExists) {
                throw new IllegalArgumentException("Ce département a déjà un responsable.");
            }

            departmentId = newDepartmentId; // On met à jour l'affectation
        } else {
            // Affecter automatiquement au département "SI"
            ResponseEntity<DepartmentDto> responseSI;
            try {
                responseSI = departmentService.getDepartementByNom("SI");
            } catch (Exception e) {
                throw new IllegalArgumentException("Erreur lors de l'affectation au département SI.");
            }

            if (responseSI.getStatusCode() != HttpStatus.OK || responseSI.getBody() == null) {
                throw new IllegalArgumentException("Le département 'SI' est introuvable.");
            }

            departmentId = responseSI.getBody().getId();
        }

        // Mise à jour des champs
        existingUser.setPrenom(updatedUser.getPrenom());
        existingUser.setNom(updatedUser.getNom());
        existingUser.setUsername(updatedUser.getUsername());
        existingUser.setRole(newRole);
        existingUser.setDepartmentId(departmentId);

        if (updatedUser.getPassword() != null && !updatedUser.getPassword().isEmpty()) {
            existingUser.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
        }

        repository.save(existingUser);
        return "Informations de l'utilisateur mises à jour avec succès.";
    }




    public List<Map<String, Object>> getAllResponsablesWithDepartments() {
        List<User> responsables = repository.findByRole(Role.Responsable);
        List<Map<String, Object>> result = new ArrayList<>();

        for (User responsable : responsables) {
            Map<String, Object> data = new HashMap<>();
            data.put("id",responsable.getId());
            data.put("username", responsable.getUsername());
            data.put("prenom", responsable.getPrenom());
            data.put("nom", responsable.getNom());
            data.put("role", responsable.getRole());

            if (!responsable.getDepartmentId().equals(UNASSIGNED_DEPARTMENT)) {
                ResponseEntity<DepartmentDto> response = departmentService.getDepartementById(responsable.getDepartmentId());
                if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                    data.put("departement", response.getBody().getNom());
                } else {
                    data.put("departement", "Département inconnu");
                }
            } else {
                data.put("departement", "Non assigné");
            }

            result.add(data);
        }

        return result;
    }

    public List<Map<String, Object>> getAllGestionnaires() {
        List<User> gestionnaires = repository.findByRole(Role.Gestionnaire);
        List<Map<String, Object>> result = new ArrayList<>();

        for (User gestionnaire : gestionnaires) {
            Map<String, Object> data = new HashMap<>();
            data.put("id",gestionnaire.getId());
            data.put("username", gestionnaire.getUsername());
            data.put("prenom", gestionnaire.getPrenom());
            data.put("nom", gestionnaire.getNom());
            data.put("role", gestionnaire.getRole());
            result.add(data);
        }

        return result;
    }


    public String getDepartmentByResponsableId(Long userId) {
        Optional<User> userOptional = repository.findById(userId);

        if (userOptional.isEmpty()) {
            throw new IllegalArgumentException("Aucun utilisateur trouvé avec l'ID : " + userId);
        }

        User user = userOptional.get();

        if (!user.getRole().equals(Role.Responsable)) {
            throw new IllegalArgumentException("L'utilisateur avec l'ID " + userId + " n'est pas un responsable.");
        }

        if (user.getDepartmentId() == null || user.getDepartmentId().equals(UNASSIGNED_DEPARTMENT)) {
            return "Non assigné";
        }

        ResponseEntity<DepartmentDto> response = departmentService.getDepartementById(user.getDepartmentId());

        if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
            return response.getBody().getNom();
        } else {
            return "Département inconnu";
        }
    }


    public Optional<User> getResponsableByDepartment(Long departmentId) {
        return repository.findByDepartmentIdAndRole(departmentId, Role.Responsable);
    }

    public User getUniqueGestionnaire() {
        return repository.findFirstByRole(Role.Gestionnaire)
                .orElseThrow(() -> new RuntimeException("Aucun gestionnaire trouvé !"));
    }





}
