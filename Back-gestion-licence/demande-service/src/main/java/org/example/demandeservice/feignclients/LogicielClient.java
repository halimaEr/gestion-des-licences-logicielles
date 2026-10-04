package org.example.demandeservice.feignclients;

import org.example.demandeservice.dto.LogicielDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;

@FeignClient(value = "logiciel-service",url = "http://localhost:8093")
public interface LogicielClient {
    @GetMapping("/logiciels/{id}")
    LogicielDTO getLogicielById(@PathVariable Long id);

    @PutMapping("/logiciels/{id}/modifiernbrlicence/{newnbrLicence}")
    public Integer updateNbrLicenceOfLogiciel(@PathVariable("id") Long id, @PathVariable Integer newnbrLicence);

}
