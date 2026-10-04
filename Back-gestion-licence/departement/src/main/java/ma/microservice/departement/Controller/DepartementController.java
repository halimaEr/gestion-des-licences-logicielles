package ma.microservice.departement.Controller;

import ma.microservice.departement.entities.Departement;
import ma.microservice.departement.models.EmployeDTO;
import ma.microservice.departement.services.DepartementServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RefreshScope
@RestController
@RequestMapping("/departements")
public class DepartementController {
    @Autowired
    private DepartementServices departementServices;
    @GetMapping()
    public List <Departement> getDepartements(){
        return departementServices.getAllDepartements();
    }
    @GetMapping("/{id}")
    public ResponseEntity<Departement> getDepartementByID(@PathVariable Long id){
        Optional<Departement> departement = departementServices.getDepartementById(id);
        if(departement.isEmpty()){
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(null);
        }
        return ResponseEntity.ok(departement.get());
    }
    @GetMapping("/departement/{id}")
    public Departement getDepartement(@PathVariable Long id){
        return departementServices.getDepartement(id);
    }
    @GetMapping("/name/{nom}")
    public ResponseEntity<Departement> getDepartementByNom(@PathVariable("nom") String nom){
        Departement departement = departementServices.getDepartementByNom(nom);
        if(departement == null){
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(departement);
        }
        return ResponseEntity.ok(departement);
    }
    @PostMapping("/add")
    public ResponseEntity<?> addDepartement(@RequestBody Departement newDepartement){
        if(departementServices.findDepartementByNom(newDepartement.getNom())){
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(Map.of(
                            "success", false,
                            "message", " Ce département existe déja."
                    ));

        }else{
            departementServices.addDepartement(newDepartement);
            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(Map.of(
                            "success", true,
                            "message", "Le département a été ajouté."
                    ));
        }
    }
    @PutMapping("/{id}")
    public ResponseEntity<?> updateDepartement(@PathVariable("id") Long id, @RequestBody Departement newDepartement,  @RequestHeader("Authorization") String authorizationHeader){
        Optional<Departement> depExist = departementServices.getDepartementById(id);
        Departement departementExitByNom = departementServices.getDepartementByNom(newDepartement.getNom());
        if(depExist.isEmpty()){
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                            "success", false,
                            "message", " Le département n’a pas pu être modifié.."
                    ));
        }else{
            if(departementExitByNom == null){
                Departement updatedDepartement = departementServices.updateDepartement(depExist.get(),newDepartement);
                return ResponseEntity
                        .status(HttpStatus.OK)
                        .body(Map.of(
                                "success", true,
                                "message", "Le département a été modifié. "
                        ));

            }
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(Map.of(
                            "success", false,
                            "message", " Un département existe déjà avec ce nom."
                    ));


        }
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDepartement(@PathVariable("id") Long id, @RequestHeader("Authorization") String authorizationHeader){
        Optional<Departement> dep = departementServices.getDepartementById(id);
        if(dep.isPresent()){
            List<EmployeDTO> employeDTOList = departementServices.geEmployesOfDepartement(id);
            if(!employeDTOList.isEmpty()){
                return ResponseEntity
                        .status(HttpStatus.CONFLICT) // 409 au lieu de 406
                        .body(Map.of(
                                "success", false,
                                "message", "Le département n’a pas été supprimé car il contient des employés."
                        ));
            } else {
                departementServices.deleteDepartement(id);
                return ResponseEntity
                        .status(HttpStatus.OK)
                        .body(Map.of(
                                "success", true,
                                "message", "Le département a été supprimé avec succès."
                        ));
            }
        } else {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                            "success", false,
                            "message", "Le département n’a pas été trouvé."
                    ));
        }
    }
    @GetMapping("/{departementId}/employes")
    public ResponseEntity<?> getEmployesOfDepartementId(@PathVariable Long departementId){
        Optional<Departement> departement = departementServices.getDepartementById(departementId);
        if(departement.isEmpty()) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                            "success", false,
                            "message", "Le département n'exist pas."
                    ));
        }else{
            List<EmployeDTO> employeDTOList = departementServices.geEmployesOfDepartement(departementId);
            return ResponseEntity
                    .ok(employeDTOList);
        }
    }
    @GetMapping("/stats")
    public Map<String, Long> getDepartementStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("totalDepartements",departementServices.conterDepartement() );
        return stats;
    }
}

