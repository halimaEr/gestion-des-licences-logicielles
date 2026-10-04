package ma.microservice.departement.feignClient;

import ma.microservice.departement.models.EmployeDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(name = "employe-service")
public interface EmployeFeignClient {

    @GetMapping("/employes/departement/{departementId}")
     List<EmployeDTO> getEmployesByDepartementId(@PathVariable("departementId") Long departementId);
}
