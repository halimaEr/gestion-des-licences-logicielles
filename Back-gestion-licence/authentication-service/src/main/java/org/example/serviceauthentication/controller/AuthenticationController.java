package org.example.serviceauthentication.controller;

import org.example.serviceauthentication.enumeration.Role;
import org.example.serviceauthentication.model.User;
import org.example.serviceauthentication.repository.UserRepository;
import org.example.serviceauthentication.service.AuthenticationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;



@RestController
@RequestMapping("/users")
public class AuthenticationController {
    private final AuthenticationService authService;
    @Autowired
    private UserRepository userRepository;

    public AuthenticationController(AuthenticationService authService) {
        this.authService = authService;
    }


    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody User request) {
        try {
            String message = authService.register(request);
            return ResponseEntity.ok(message);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Une erreur interne est survenue. Veuillez réessayer plus tard.");
        }
    }
    @PutMapping("/update/{userId}")
    public ResponseEntity<String> updateUser(@PathVariable Long userId, @RequestBody User updatedUser) {
        try{
            String responseMessage = authService.updateUser(userId, updatedUser);
            return ResponseEntity.ok(responseMessage);
        } catch(IllegalArgumentException e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Une erreur interne est survenue. Veuillez réessayer plus tard.");
        }

    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User request) {
        try {
            Map<String, Object> result = authService.authenticate(request); // Type de retour Map
            if (result.containsKey("error")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(result); // Renvoie { "error": "..." }
            } else {
                return ResponseEntity.ok(result);
            }

        } catch (Exception ex) {
            // 4. Gère les erreurs inattendues du contrôleur lui-même
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Authentication process failed on server");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    @GetMapping("/{id}")
    public ResponseEntity<User> getUser(@PathVariable("id") Long id) {
        Optional<User> user = authService.getUserById(id);

        return user.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/current")
    public ResponseEntity<User> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7);
            User user = authService.getUserFromToken(token);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        String responseMessage = authService.DeleteUser(id);
        return ResponseEntity.ok(responseMessage);
    }



    @GetMapping("/responsables")
    public ResponseEntity<List<Map<String, Object>>> getAllResponsablesWithDepartments() {
        List<Map<String, Object>> responsables = authService.getAllResponsablesWithDepartments();
        return ResponseEntity.ok(responsables);
    }

    @GetMapping("/gestionnaires")
    public ResponseEntity<List<Map<String, Object>>> getAllGestionnaires() {
        List<Map<String, Object>> gestionnaires = authService.getAllGestionnaires();
        return ResponseEntity.ok(gestionnaires);
    }

    @GetMapping("/responsables/{userId}/departement")
    public ResponseEntity<String> getDepartmentByResponsableId(@PathVariable Long userId) {
        String departmentName = authService.getDepartmentByResponsableId(userId);
        return ResponseEntity.ok(departmentName);
    }


    @GetMapping("/department/{deptId}/responsable")
    public Optional<User> getResponsableByDepartment(@PathVariable Long deptId) {
        Optional<User> optDto = authService.getResponsableByDepartment(deptId);
     return optDto;
    }

    @GetMapping("/gestionnaire")
    public ResponseEntity<User> getGestionnaire() {
        User gestionnaire = authService.getUniqueGestionnaire();
        return ResponseEntity.ok(gestionnaire);
    }

    @GetMapping("/gestionnaire/email")
    public ResponseEntity<String> getGestionnaireEmail() {
        try {
            // Récupérer le gestionnaire unique (role = 'GESTIONNAIRE')
            User gestionnaire = userRepository.findFirstByRole(Role.Gestionnaire)
                    .orElseThrow(() -> new RuntimeException("Aucun gestionnaire trouvé"));

            return ResponseEntity.ok(gestionnaire.getUsername());
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }


}
