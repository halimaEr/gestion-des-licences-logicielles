package ma.microservice.employe.controller;

import feign.FeignException;
import ma.microservice.employe.services.EmployeService;
import ma.microservice.employe.models.DepartementDTO;
import ma.microservice.employe.entities.Employe;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RefreshScope // actialiser les params qui ont avoir @value car il sont des variables de configuration
@RestController
@RequestMapping("/employes")
public class EmployeControler {
    @Autowired
    private EmployeService employeService;

    @GetMapping()
    public List<Employe> getEmployes(){
        return employeService.getEmployes();
    }

    @GetMapping("/{id}")
    public Optional<Employe> getEmployeById(@PathVariable Long id){
        return employeService.getEmployeById(id);
    }

    @GetMapping("/employe/{id}")
    public Employe getEmploye(@PathVariable Long id){
        return employeService.getEmploye(id);
    }


    @PostMapping("/add")
    public ResponseEntity<?> addEmploye(@RequestBody Employe newEmploye, @RequestHeader("Authorization") String authorizationHeader) {
        if (employeService.findEmployeByEmail(newEmploye.getEmail())) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(Map.of(
                            "success", false,
                            "message", "Employé déjà existant"
                    ));

        }else{
            try {
                DepartementDTO departementDTO = employeService.getDepartementId(newEmploye.getDepartementId());
                employeService.addEmploye(newEmploye);
                return ResponseEntity
                        .status(HttpStatus.OK)
                        .body(Map.of(
                                "success", true,
                                "message", "Employé a été ajouté"
                        ));

            } catch (FeignException e) {
                if (e.status() == 404) {
                    return ResponseEntity
                            .status(HttpStatus.NOT_FOUND)
                            .body(Map.of(
                                    "success", false,
                                    "message", "Département avec cet ID n'existe pas."
                            ));
                }
                return ResponseEntity
                        .status(HttpStatus.INTERNAL_SERVER_ERROR) .body(Map.of(
                                "success", false,
                                "message", "Erreur lors de la communication avec le microservice département."
                        ));
            }
        }

    }
    @PutMapping("/{id}")
    public ResponseEntity<?> updateEmploye(@PathVariable("id") Long id, @RequestBody Employe newEmploye, @RequestHeader("Authorization") String authorizationHeader){
        Optional<Employe> employeExist = employeService.getEmployeById(id);
        if(employeExist.isEmpty()){
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("employe n'exist pas");
        }else{
            try {
                DepartementDTO departementDTO = employeService.getDepartementId(newEmploye.getDepartementId());
                Employe updatedEmploye = employeService.updateEmploye(employeExist.get(),newEmploye);
                return ResponseEntity
                        .status(HttpStatus.OK)
                        .body(Map.of(
                                "success", true,
                                "message", "employe  modifie"
                        ));
            } catch (FeignException e) {
                if (e.status() == 404) {
                    return ResponseEntity
                            .status(HttpStatus.NOT_FOUND)
                            .body(Map.of(
                                    "success", false,
                                    "message", "Département avec cet ID n'existe pas."
                            ));
                }
                return ResponseEntity
                        .status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of(
                                "success", false,
                                "message", "Erreur lors de la communication avec le microservice département."
                        ));
            }
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEmploye(@PathVariable("id") Long id, @RequestHeader("Authorization") String authorizationHeader){
        Optional<Employe> employe = employeService.getEmployeById(id);
        if(employe.isPresent()){
            employeService.deleteEmploye(id);
            return ResponseEntity
                    .status(HttpStatus.OK)
                    .body(Map.of(
                            "success", true,
                            "message", "employe a été supprimer "
                    ));

        }else{
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                            "success", false,
                            "message", "employe n'exist pas "
                    ));


        }
    }

    @GetMapping("/{id}/departement")
    public ResponseEntity<DepartementDTO> getDepartementEmployeById(@PathVariable Long id){
        DepartementDTO departementDTO = employeService.getDepartementEmployeByID(id);
        return ResponseEntity.ok(departementDTO);
    }

    @GetMapping("/departement/{departementId}")
    public List<Employe> getEmployesByDepartementId(@PathVariable Long departementId){
        return employeService.getEmployesByDepartementId(departementId);
    }

    @GetMapping("/stats")
    public Map<String, Long> getEmployeStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("totalEmployes",employeService.conterEmployes() );
        return stats;
    }

    @PostMapping("/search/by-ids")
    public ResponseEntity<List<Employe>> getEmployesByIds(@RequestBody List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        List<Employe> employes = employeService.findByIds(ids);
        return ResponseEntity.ok(employes);
    }



}
