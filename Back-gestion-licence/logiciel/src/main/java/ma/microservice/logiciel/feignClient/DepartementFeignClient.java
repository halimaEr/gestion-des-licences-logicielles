package ma.microservice.logiciel.feignClient;

import ma.microservice.logiciel.models.DepartementDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(value = "departements-service")
public interface DepartementFeignClient {
    @GetMapping("/departements/{id}")
    ResponseEntity<DepartementDTO> getDepartementByID(@PathVariable Long id);
    @GetMapping("/departements/departement/{id}")
    DepartementDTO getDepartement(@PathVariable Long id);
}
