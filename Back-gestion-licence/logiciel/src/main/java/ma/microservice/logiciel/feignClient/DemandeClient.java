package ma.microservice.logiciel.feignClient;

import ma.microservice.logiciel.models.DemandeDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

// DemandeClient.java
@FeignClient(name = "demande-service")
public interface DemandeClient {

    @PostMapping("/demandes/lier")
    void lieDemandeParLogiciel(@RequestParam Long idDemande, @RequestParam Long idLogiciel);

    @GetMapping("/demandes/demande/{id}")
     DemandeDTO getDemandeById(@PathVariable Long id);

    @GetMapping("/demandes/all")
     List<DemandeDTO> getAllDemandesSansDetails();


}
