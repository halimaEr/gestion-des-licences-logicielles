package ma.microservice.logiciel.feignClient;

import ma.microservice.logiciel.models.EmployeDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;
import java.util.Optional;

@FeignClient(value = "employe-service",url="http://localhost:8099")
public interface EmployeFeignClient {
    @GetMapping("/employes/departement/{departementId}")
    List<EmployeDTO> getEmployesByDepartementId(@PathVariable Long departementId);

    @GetMapping("/employes/{id}")
    Optional<EmployeDTO> getEmployeById(@PathVariable Long id);
    @GetMapping("/employes/employe/{id}")
    EmployeDTO getEmploye(@PathVariable Long id);

}
