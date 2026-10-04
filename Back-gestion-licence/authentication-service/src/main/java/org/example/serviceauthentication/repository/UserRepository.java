package org.example.serviceauthentication.repository;

import org.example.serviceauthentication.enumeration.Role;
import org.example.serviceauthentication.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User,Long> {

    Optional<User> findByUsername(String username);
    Optional<User> findByDepartmentId(Long departmentId);
    List<User> findByRole(Role role);
    Optional<User> findByDepartmentIdAndRole(Long departmentId, Role role);
    Optional<User> findFirstByRole(Role role);



}
