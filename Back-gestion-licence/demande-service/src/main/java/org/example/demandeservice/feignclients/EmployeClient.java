package org.example.demandeservice.feignclients;

import org.example.demandeservice.dto.EmployeDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@FeignClient(value = "employe-service",url = "http://localhost:8099")
public interface EmployeClient {

    @GetMapping("/employes/{id}")
    Optional<EmployeDTO> getEmployeById(@PathVariable("id") Long id);

    @PostMapping("/employes/search/by-ids")
    List<EmployeDTO> getEmployesByIds(@RequestBody List<Long> ids);
}
