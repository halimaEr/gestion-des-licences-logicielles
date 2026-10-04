package ma.microservice.employe.services;

import jakarta.transaction.Transactional;
import ma.microservice.employe.models.DepartementDTO;
import ma.microservice.employe.feignClient.DepartementFeignClient;
import ma.microservice.employe.entities.Employe;
import ma.microservice.employe.repositories.EmployeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class EmployeService {
    @Autowired
    private EmployeRepository employeRepository;
    @Autowired
    private DepartementFeignClient departementFeignClient;

    public Optional<Employe> getEmployeById(Long id){
        return employeRepository.findById(id);
    }
    public Employe getEmploye(Long id){
        return employeRepository.findById(id).orElse(null);
    }
    public boolean findEmployeByEmail(String email){
        return employeRepository.existsByEmail(email);
    }
    public List<Employe> getEmployes(){
        return employeRepository.findAll();
    }

    public Employe addEmploye(Employe employe){
        return employeRepository.save(employe);
    }
    public Employe updateEmploye(Employe employeExist, Employe newEmploye){
        employeExist.setNom(newEmploye.getNom());
        employeExist.setPrenom(newEmploye.getPrenom());
        employeExist.setProfil(newEmploye.getProfil());
        employeExist.setEmail(newEmploye.getEmail());
        employeExist.setDepartementId(newEmploye.getDepartementId());
        return employeRepository.save(employeExist);
    }
    public void deleteEmploye(Long id){
        employeRepository.deleteById(id);
    }



    public DepartementDTO getDepartementId(Long id){
        return departementFeignClient.getDepartementByID(id);
    }

    // donner le departement de l employe avec id de l 'employe ghhhh

    public DepartementDTO getDepartementEmployeByID(Long idEmploye){
        Employe employe = employeRepository.findById(idEmploye).orElseThrow(()->new RuntimeException("Employe non trouve"));
        Long idDepartement=employe.getDepartementId();
        return departementFeignClient.getDepartementByID(idDepartement);
    }


    public List<Employe> getEmployesByDepartementId(Long depratementId){
        return employeRepository.findAllByDepartementId(depratementId);
    }
    public long conterEmployes(){
        return employeRepository.count();
    }

    public List<Employe> findByIds(List<Long> ids) {
        return employeRepository.findAllById(ids).stream()
                .map(emp -> new Employe(emp.getId(), emp.getPrenom(), emp.getNom(), emp.getEmail(), emp.getProfil(), emp.getDepartementId()))
                .collect(Collectors.toList());
    }

}
