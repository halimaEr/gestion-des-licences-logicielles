package org.example.demandeservice.feignclients;

import org.example.demandeservice.dto.UtilisateurDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@FeignClient(name = "authentication-service")
public interface ResponsableClient {

    @GetMapping("/users/{id}")
    Optional<UtilisateurDTO> getUser(@PathVariable("id") Long id) ;
    @GetMapping("/users/responsables/{userId}/departement")
    ResponseEntity<String> getDepartmentByResponsableId(@PathVariable Long userId);
}
