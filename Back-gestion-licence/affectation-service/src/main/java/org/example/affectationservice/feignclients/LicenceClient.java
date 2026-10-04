package org.example.affectationservice.feignclients;

import org.example.affectationservice.dto.EmployeDTO;
import org.example.affectationservice.dto.LicenceDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;

import java.util.Optional;
@FeignClient(value = "logiciel-service",url="http://localhost:8093")
public interface LicenceClient {

    @GetMapping("/licences/{id}")
    LicenceDTO getLicences(@PathVariable Long id);

    @PutMapping("/licences/{licenceId}/liberer")
    ResponseEntity<LicenceDTO> libererLicence(@PathVariable Long licenceId);



}
