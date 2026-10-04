package org.example.demandeservice.repository;

import org.example.demandeservice.model.Demande;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface DemandeRepository extends JpaRepository<Demande,Long> {
    List<Demande> findByResponsableId(Long responsableId);


    List<Demande> findByLogicielId(Long logicielId);

    long countByStatut(String status);
}
