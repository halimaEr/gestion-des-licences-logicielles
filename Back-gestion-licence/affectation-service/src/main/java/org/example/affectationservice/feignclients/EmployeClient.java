package org.example.affectationservice.feignclients;

import org.example.affectationservice.dto.EmployeDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.Optional;

@FeignClient(value = "employe-service",url="http://localhost:8099")
public interface EmployeClient {

    @GetMapping("/employes/{id}")
    Optional<EmployeDTO> getEmployeById(@PathVariable("id") Long id);

    @GetMapping("/employes/employe/{id}")
    EmployeDTO getEmploye(@PathVariable Long id);

}
