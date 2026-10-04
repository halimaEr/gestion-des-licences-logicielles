package org.example.serviceauthentication.service;

import org.example.serviceauthentication.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class UserDetailsServiceImp implements UserDetailsService {
    private final UserRepository repository;

    public UserDetailsServiceImp(UserRepository repository) {
        this.repository = repository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException { //charger les détails de l'utilisateur en fonction de son nom d'utilisateur.
        return repository.findByUsername(username)
                .orElseThrow(()-> new UsernameNotFoundException("User not found"));

    }
    // Elle permet de charger les détails d’un utilisateur
    // (comme son nom d’utilisateur, son mot de passe, ses rôles/autorités)
    // pendant le processus d’authentification .
}
