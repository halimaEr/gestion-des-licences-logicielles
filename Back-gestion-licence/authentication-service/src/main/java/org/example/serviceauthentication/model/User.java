package org.example.serviceauthentication.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.serviceauthentication.enumeration.Role;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class User implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nom;
    private String prenom;
    private String username;
    private String password;
    @Enumerated(value = EnumType.STRING)
    private Role role;
    private Long departmentId;

    @Transient
    private String departementName;

    public String getDepartementName() {
        return departementName;
    }

    public void setDepartementName(String departementName) {
        this.departementName = departementName;
    }

    public Long getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(Long departmentId) {
        this.departmentId = departmentId;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    } //indiquer l'état du compte de l'utilisateur.
    @Override
    public boolean isAccountNonLocked() {
        return true;
    } //indiquer l'état du compte de l'utilisateur.
    @Override
    public boolean isCredentialsNonExpired() { //indiquer l'état du compte de l'utilisateur.
        return true;
    }
    @Override
    public boolean isEnabled() {
        return true;
    } //indiquer l'état du compte de l'utilisateur.
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() { //retourne une liste d'autorités (GrantedAuthority) associées à l'utilisateur.
        return List.of(new SimpleGrantedAuthority(role.name()));
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getPrenom() {
        return prenom;
    }

    public void setPrenom(String prenom) {
        this.prenom = prenom;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }
}
