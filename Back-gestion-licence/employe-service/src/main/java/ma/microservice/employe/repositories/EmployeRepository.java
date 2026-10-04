package ma.microservice.employe.repositories;

import ma.microservice.employe.entities.Employe;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EmployeRepository extends JpaRepository<Employe, Long> {
    List<Employe> findAllByDepartementId(Long departementId);
    boolean existsByEmail(String email);


}
