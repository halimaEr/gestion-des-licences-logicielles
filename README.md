# Gestion des licences logicielles

Application web de **gestion des licences logicielles** basée sur une **architecture microservices**.  
La solution permet de centraliser le suivi des logiciels, la gestion des licences, leur attribution aux employés et le contrôle de leur utilisation.

## 📌 Présentation

Dans un environnement professionnel, la gestion des licences logicielles nécessite un suivi précis des licences disponibles, attribuées, expirées ou libérées.

Ce projet propose une solution permettant de :

- gérer les logiciels et leurs licences ;
- gérer les employés et les départements ;
- soumettre et traiter les demandes de licences ;
- attribuer les licences aux employés ;
- suivre l'état des licences ;
- gérer les utilisateurs et leurs rôles ;
- recevoir des notifications avant l'expiration d'une licence ;
- consulter des indicateurs permettant d'optimiser l'utilisation des licences.

L'application est développée selon une **architecture microservices**, permettant de séparer les différentes responsabilités fonctionnelles et de faciliter la maintenance et l'évolution du système.

---

## 🏗️ Architecture

Le projet est organisé autour de plusieurs microservices communiquant via des API REST.

```text
                    ┌─────────────────────┐
                    │      Frontend       │
                    │   Angular + Tailwind│
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │    Service Proxy    │
                    │      Gateway        │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
      ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
      │Authentication│ │   Demande    │ │   Logiciel   │
      │   Service    │ │   Service    │ │   Service    │
      └──────────────┘ └──────────────┘ └──────────────┘
              │                │                │
              └────────────────┼────────────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
      ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
      │   Employé    │ │ Affectation  │ │ Département  │
      │   Service    │ │   Service    │ │   Service    │
      └──────────────┘ └──────────────┘ └──────────────┘

                    ┌─────────────────────┐
                    │ Service Discovery   │
                    │      Eureka         │
                    └─────────────────────┘

                    ┌─────────────────────┐
                    │    Service Config   │
                    │   Configuration     │
                    └─────────────────────┘
```

## Microservices

| Service                  | Description                                                       |
| ------------------------ | ----------------------------------------------------------------- |
| `authentication-service` | Gestion de l'authentification, des utilisateurs et des tokens JWT |
| `demande-service`        | Gestion des demandes de logiciels                                 |
| `logiciel`               | Gestion des logiciels et des licences                             |
| `employe-service`        | Gestion des employés                                              |
| `affectation-service`    | Gestion de l'attribution des licences                             |
| `departement`            | Gestion des départements                                          |
| `service-discovery`      | Découverte et enregistrement des microservices avec Eureka        |
| `service-config`         | Gestion centralisée de la configuration                           |
| `service-proxy`          | API Gateway permettant l'accès aux différents services            |
| `frontend`               | Interface web développée avec Angular                             |

---

## Fonctionnalités principales

### Authentification et sécurité

* Authentification des utilisateurs.
* Gestion des utilisateurs et des rôles.
* Sécurisation des API avec Spring Security.
* Authentification basée sur JWT.
* Contrôle d'accès aux différentes fonctionnalités.

### Gestion des logiciels

Le système permet au gestionnaire de :

* ajouter un logiciel ;
* modifier les informations d'un logiciel ;
* consulter les logiciels disponibles ;
* gérer les licences associées ;
* suivre les coûts des logiciels.

### Gestion des demandes

Le responsable de département peut :

* consulter les logiciels disponibles ;
* sélectionner un logiciel ;
* indiquer la quantité souhaitée ;
* envoyer une demande ;
* consulter l'état de ses demandes.

Le gestionnaire peut ensuite :

* consulter les demandes ;
* valider ou traiter les demandes ;
* créer les licences nécessaires ;
* suivre l'évolution des demandes.

### Gestion des employés

Le système permet de :

* créer un employé ;
* modifier ses informations ;
* consulter les employés ;
* associer un employé à un département ;
* consulter les licences attribuées à chaque employé.

### Attribution des licences

Le système permet de :

* attribuer une licence à un employé ;
* consulter les licences attribuées ;
* suivre l'utilisation des licences ;
* libérer une licence ;
* réutiliser les licences disponibles.

### Gestion de l'expiration

Les licences peuvent avoir différents états :

```text
ACTIVE
EXPIRED
LIBERE
```

Une tâche planifiée vérifie régulièrement les dates d'expiration.

Une notification par email peut être envoyée **3 jours avant l'expiration d'une licence** afin de permettre son renouvellement ou sa libération.

### Suivi et optimisation

L'application permet également de suivre :

* le nombre de licences utilisées ;
* les licences disponibles ;
* les licences expirées ;
* les licences libérées ;
* les coûts par logiciel ;
* les coûts par département ;
* les indicateurs clés de performance (KPI).

Les données peuvent également être exportées sous forme de fichier Excel.

---

## Technologies utilisées

### Backend

* Java
* Spring Boot
* Spring Cloud
* Spring Security
* JWT
* Spring Data JPA
* REST API
* OpenFeign
* Eureka
* Spring Cloud Config
* Spring Cloud Gateway

### Frontend

* Angular 19
* TypeScript
* HTML5
* CSS3
* Tailwind CSS

### Base de données

* MySQL

### Outils

* Git
* GitHub
* IntelliJ IDEA
* Visual Studio Code
* Postman

---

## Architecture technique

Les microservices communiquent principalement à travers des API REST.

**OpenFeign** est utilisé pour simplifier les appels entre les différents services.

**Eureka** permet aux microservices de s'enregistrer et de découvrir automatiquement les autres services disponibles.

**Spring Cloud Gateway** sert de point d'entrée pour les requêtes provenant du frontend.

**Spring Cloud Config** permet de centraliser la configuration des différents services.

---

## Structure du projet

```text
str-project/
│
├── affectation-service/
│
├── authentication-service/
│
├── demande-service/
│
├── departement/
│
├── employe-service/
│
├── logiciel/
│
├── service-config/
│
├── service-discovery/
│
├── service-proxy/
│
├── frontend/
│
├── src/
│
├── .gitignore
├── .gitattributes
├── pom.xml
├── mvnw
└── mvnw.cmd
```

## Prérequis

Avant d'exécuter le projet, il est nécessaire d'avoir installé :

* Java JDK ;
* Maven ou Maven Wrapper ;
* Node.js ;
* npm ;
* Angular CLI ;
* MySQL ;
* Git.

Vérifier les installations :

```bash
java -version
mvn -version
node -v
npm -v
git --version
```

---

## Installation

### 1. Cloner le projet

```bash
git clone https://github.com/Meryem-Khayati/str-project.git
```

Entrer dans le projet :

```bash
cd str-project
```

---

### 2. Configurer MySQL

Créer les bases de données nécessaires aux différents microservices selon les configurations du projet.

Exemple :

```sql
CREATE DATABASE authentication;
CREATE DATABASE demande;
CREATE DATABASE logiciel;
CREATE DATABASE employe;
CREATE DATABASE affectation;
CREATE DATABASE departement;
```

Les paramètres de connexion doivent ensuite être configurés dans les fichiers de configuration correspondants.

Exemple :

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/nom_database
spring.datasource.username=root
spring.datasource.password=mot_de_passe
```

---

## Lancement du backend

Il est recommandé de démarrer les services dans l'ordre suivant.

### 1. Service Discovery

Lancer :

```text
service-discovery
```

Ce service fournit le serveur Eureka permettant l'enregistrement et la découverte des microservices.

---

### 2. Config Service

Lancer :

```text
service-config
```

Ce service permet de centraliser les configurations.

---

### 3. Microservices

Démarrer ensuite :

```text
authentication-service
demande-service
logiciel
employe-service
affectation-service
departement
```

---

### 4. API Gateway

Démarrer :

```text
service-proxy
```

La Gateway sert de point d'entrée pour les requêtes provenant du frontend.

---

## Lancement du frontend

Entrer dans le dossier frontend :

```bash
cd frontend
```

Installer les dépendances :

```bash
npm install
```

Lancer l'application Angular :

```bash
ng serve
```

L'application sera ensuite accessible depuis :

```text
http://localhost:4200
```

---

