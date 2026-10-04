package ma.microservice.employe;

import ma.microservice.employe.repositories.EmployeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

@EnableFeignClients
@EnableDiscoveryClient
@SpringBootApplication
public class EmployeApplication {
	
	public static void main(String[] args) {
		SpringApplication.run(EmployeApplication.class, args);
	}



}
