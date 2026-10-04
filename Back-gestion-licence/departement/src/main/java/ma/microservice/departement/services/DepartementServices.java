package ma.microservice.departement.services;

import jakarta.transaction.Transactional;
import ma.microservice.departement.entities.Departement;
import ma.microservice.departement.repositories.DepartementRepository;
import ma.microservice.departement.models.EmployeDTO;
import ma.microservice.departement.feignClient.EmployeFeignClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class DepartementServices {
    @Autowired
    private DepartementRepository departementRepository;
    @Autowired
    private EmployeFeignClient employeFeignClient;

    public Optional<Departement> getDepartementById(Long id){
        return departementRepository.findById(id);
    }
    public Departement getDepartement(Long id){
        return departementRepository.findById(id).orElse(null);
    }
    public List<Departement> getAllDepartements(){
        return departementRepository.findAll();
    }
    public boolean findDepartementByNom(String nom){return departementRepository.existsByNom(nom);}
    public Departement addDepartement(Departement departement){
        return departementRepository.save(departement);
    }
    public Departement updateDepartement(Departement departementExist, Departement newDepartement){
        departementExist.setNom(newDepartement.getNom());
       return departementRepository.save(departementExist);
    }
    public void deleteDepartement(Long id){
        departementRepository.deleteById(id);
    }

     public Departement getDepartementByNom(String nom){return departementRepository.findDepartementByNom(nom);}

    public List<EmployeDTO> geEmployesOfDepartement(Long departementId){
        return employeFeignClient.getEmployesByDepartementId(departementId);
    }
    public long conterDepartement(){
        return departementRepository.count();
    }




}
