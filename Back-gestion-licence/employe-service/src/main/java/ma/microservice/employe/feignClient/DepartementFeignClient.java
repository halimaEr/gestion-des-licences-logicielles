package ma.microservice.employe.feignClient;

import ma.microservice.employe.models.DepartementDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "departements-service")
public interface DepartementFeignClient {

    @GetMapping("/departements/{id}")
    DepartementDTO getDepartementByID(@PathVariable Long id);
}
