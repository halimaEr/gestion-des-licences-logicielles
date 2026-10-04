package org.example.serviceauthentication.feignclients;

import org.example.serviceauthentication.dto.DepartmentDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "departements-service", url = "http://localhost:8089")
public interface DepartmentService {

    @GetMapping("/departements/name/{nom}")
    ResponseEntity<DepartmentDto> getDepartementByNom(@PathVariable String nom);

    @GetMapping("/departements/{id}")
    ResponseEntity<DepartmentDto> getDepartementById(@PathVariable Long id);

}
