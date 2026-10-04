package ma.microservice.departement.repositories;

import ma.microservice.departement.entities.Departement;
import org.springframework.data.jpa.repository.JpaRepository;
public interface DepartementRepository extends JpaRepository<Departement,Long> {
    Departement findByNom(String nom);

    boolean existsByNom(String nom);

    Departement findDepartementByNom(String nom);
}
