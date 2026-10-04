package ma.microservice.logiciel.feignClient;

import ma.microservice.logiciel.models.UserDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.Optional;

@FeignClient(value = "authentication-service",url="http://localhost:8081")

public interface UserFeignClient {
    @GetMapping("/users/department/{deptId}/responsable")
    Optional<UserDTO> getResponsableByDepartment(@PathVariable Long deptId);

    @GetMapping("/users/{id}")
    ResponseEntity<UserDTO> getUser(@PathVariable("id") Long id) ;

    @GetMapping("/users/gestionnaire")
    ResponseEntity<UserDTO> getGestionnaire() ;
}
