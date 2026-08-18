# Document d'exigences

## 1. Aperçu de l'application

**Nom de l'application** : Site web Société Supersonic

**Description** : Site web professionnel de catalogue e-commerce pour Société Supersonic, entreprise spécialisée dans la vente de produits électroniques, électroménagers, mobiliers, informatiques et bureautiques au Congo (Brazzaville et Pointe-Noire). Le site permet aux clients de consulter les produits, passer des commandes et contacter l'entreprise. Un espace d'administration sécurisé permet à l'entreprise de gérer l'ensemble du contenu.

## 2. Utilisateurs et scénarios d'utilisation

**Utilisateurs cibles** :
- Clients : Particuliers et professionnels au Congo recherchant des produits électroniques, électroménagers, mobiliers, informatiques et bureautiques
- Administrateurs : Personnel de Société Supersonic gérant le contenu du site
- Éditeurs : Personnel autorisé à gérer produits, publications et promotions

**Scénarios principaux** :
- Client consulte le catalogue, recherche un produit spécifique et passe une commande
- Client découvre les promotions en cours et contacte l'entreprise
- Administrateur ajoute de nouveaux produits et gère les commandes
- Éditeur publie une actualité sur un nouvel arrivage

## 3. Structure des pages et fonctionnalités

### 3.1 Structure globale

```
Site public
├── Accueil
├── Produits
│   └── Détail produit
├── Promotions
├── Publications/Actualités
├── Nos magasins
└── Contact

Espace administration (/admin)
├── Tableau de bord
├── Gestion des produits
├── Gestion des publications
├── Gestion des promotions
├── Gestion des commandes
├── Gestion des catégories
├── Gestion des marques
├── Gestion des magasins
├── Gestion des utilisateurs
└── Paramètres
```

### 3.2 Pages publiques

#### 3.2.1 Page d'accueil

**Éléments visuels** :
- Logo Supersonic (https://miaoda-conversation-file.s3cdn.medo.dev/user-dg06phmgr9c0/app-dsazr1cm25tt/20260817/file_00000000971482438d70a20248281418.png) affiché dans le header sans déformation
- Design inspiré de l'image de référence (https://miaoda-conversation-file.s3cdn.medo.dev/user-dg06phmgr9c0/app-dsazr1cm25tt/20260817/Screenshot_20260816-085312.jpg)
- Palette de couleurs : Bleu foncé (#1a2e6e ou similaire), Rouge (#e31e24 ou similaire), Blanc, Gris clair

**Header** :
- Logo Supersonic
- Menu de navigation (Accueil, Produits, Promotions, Actualités, Magasins, Contact)
- Barre de recherche
- Bouton de contact

**Contenu principal** :
- Bannière principale/Hero avec message d'accueil
- Section promotions en cours
- Section produits populaires
- Section nouveautés
- Section catégories (Électronique, Électroménager, Mobilier, Informatique, Bureautique)
- Section marques partenaires
- Section présentation de Supersonic
- Section nos magasins (Brazzaville et Pointe-Noire)
- Section informations de contact
- Section réseaux sociaux

**Boutons d'action** :
- Découvrir nos produits
- Voir les promotions
- Commander
- Nous contacter

**Footer** :
- Informations de contact complètes
- Liens rapides
- Réseaux sociaux
- Mentions légales

#### 3.2.2 Page Produits

**Fonctionnalités de recherche et filtrage** :
- Barre de recherche par nom de produit
- Filtres :
  - Catégorie (Électronique, Électroménager, Mobilier, Informatique, Bureautique)
  - Marque
  - Fourchette de prix
  - Disponibilité (En stock, Rupture de stock)
  - En promotion
- Options de tri (Prix croissant/décroissant, Nouveautés, Popularité)
- Pagination

**Affichage des produits** :
- Grille de produits avec image, nom, marque, prix, badge promotion si applicable, badge rupture de stock si applicable

#### 3.2.3 Page détail produit

**Informations produit** :
- Galerie d'images (plusieurs photos)
- Nom du produit
- Marque
- Prix
- Prix promotionnel (si applicable)
- Pourcentage de réduction (si applicable)
- Statut de disponibilité
- Description détaillée
- Caractéristiques techniques
- Informations de garantie
- Indication de stock

**Actions** :
- Bouton Commander (ouvre le formulaire de commande)
- Bouton Contacter Supersonic (WhatsApp ou téléphone)

**Section complémentaire** :
- Produits similaires

#### 3.2.4 Formulaire de commande

**Champs** :
- Nom complet (obligatoire)
- Numéro de téléphone (obligatoire)
- Ville (obligatoire)
- Produit (pré-rempli)
- Quantité (obligatoire)
- Adresse ou lieu de livraison (obligatoire)
- Commentaire (optionnel)

**Actions** :
- Enregistrement de la commande dans la base de données
- Génération automatique d'un message WhatsApp pré-rempli avec le nom du produit et les informations de commande
- Option de contact direct via WhatsApp ou téléphone

#### 3.2.5 Page Promotions

**Affichage des promotions actives** :
- Image de la promotion
- Titre
- Description
- Ancien prix
- Nouveau prix
- Pourcentage de réduction
- Date de début
- Date de fin
- Lien vers le produit concerné

**Règle d'affichage** :
- Les promotions expirées (date de fin dépassée) disparaissent automatiquement de l'affichage public

#### 3.2.6 Page Publications/Actualités

**Types de publications** :
- Nouveaux arrivages
- Promotions
- Annonces
- Événements
- Offres spéciales
- Informations commerciales

**Affichage** :
- Liste des publications avec image, titre, extrait de description, date de publication
- Détail de publication : titre, image, description complète, date

#### 3.2.7 Page Nos magasins

**Magasin Pointe-Noire** :
- Adresse complète
- Numéros de téléphone
- Email
- Horaires d'ouverture
- Localisation sur carte

**Magasin Brazzaville** :
- Adresse complète
- Numéros de téléphone
- Email
- Horaires d'ouverture
- Localisation sur carte

**Carte interactive** :
- Affichage de la localisation des deux magasins

### 3.3 Espace d'administration

**Accès** :
- URL : /admin
- Interface totalement séparée de l'interface publique
- Authentification requise

#### 3.3.1 Tableau de bord

**Statistiques affichées** :
- Nombre total de produits
- Nombre de produits disponibles
- Nombre de produits en rupture de stock
- Nombre de publications
- Nombre de promotions actives
- Nombre de commandes
- Nombre de clients
- Statistiques de consultation du site
- Graphique d'activité du site

#### 3.3.2 Gestion des produits

**Actions disponibles** :
- Ajouter un nouveau produit
- Modifier un produit existant
- Supprimer un produit
- Publier/Dépublier un produit
- Mettre un produit à la une

**Informations produit** :
- Nom
- Marque (sélection depuis la liste des marques)
- Catégorie (sélection depuis la liste des catégories)
- Prix
- Prix promotionnel (optionnel)
- Stock
- Description
- Caractéristiques techniques
- Informations de garantie
- Statut de disponibilité
- Plusieurs photos (upload vers le stockage)

#### 3.3.3 Gestion des publications

**Actions disponibles** :
- Créer une nouvelle publication
- Modifier une publication existante
- Supprimer une publication
- Publier une publication
- Programmer une publication (date de publication future)
- Dépublier une publication

**Informations publication** :
- Titre
- Image (upload)
- Description (éditeur de texte simple)
- Date de publication
- Statut (Brouillon, Publiée, Programmée)

#### 3.3.4 Gestion des promotions

**Actions disponibles** :
- Créer une nouvelle promotion
- Modifier une promotion existante
- Supprimer une promotion
- Activer/Désactiver une promotion

**Informations promotion** :
- Titre
- Description
- Image
- Produit concerné (sélection depuis la liste des produits)
- Ancien prix
- Nouveau prix
- Pourcentage de réduction (calculé automatiquement)
- Date de début
- Date de fin
- Statut (Active, Inactive, Expirée)

#### 3.3.5 Gestion des commandes

**Affichage des commandes** :
- Liste des commandes avec : Nom du client, Téléphone, Produit, Quantité, Montant total, Ville, Date de commande, Statut

**Statuts de commande** :
- Nouvelle
- En cours
- Confirmée
- Préparée
- Livrée
- Annulée

**Actions** :
- Modifier le statut d'une commande
- Consulter les détails d'une commande
- Supprimer une commande

#### 3.3.6 Gestion des catégories

**Actions disponibles** :
- Ajouter une nouvelle catégorie
- Modifier une catégorie existante
- Supprimer une catégorie

**Informations catégorie** :
- Nom de la catégorie
- Description (optionnel)

**Catégories initiales** :
- Électronique
- Électroménager
- Mobilier
- Informatique
- Bureautique

#### 3.3.7 Gestion des marques

**Actions disponibles** :
- Ajouter une nouvelle marque
- Modifier une marque existante
- Supprimer une marque

**Informations marque** :
- Nom de la marque
- Logo (optionnel)

#### 3.3.8 Gestion des magasins

**Actions disponibles** :
- Modifier les informations du magasin de Pointe-Noire
- Modifier les informations du magasin de Brazzaville

**Informations modifiables** :
- Adresse
- Numéros de téléphone
- Email
- Horaires d'ouverture
- Coordonnées GPS pour la carte

#### 3.3.9 Gestion des utilisateurs

**Rôles disponibles** :
- Administrateur : Accès complet à toutes les fonctionnalités
- Éditeur : Accès à la gestion des produits, publications et promotions
- Client : Accès uniquement à l'interface publique

**Actions disponibles (Administrateur uniquement)** :
- Créer un nouvel utilisateur
- Modifier les informations d'un utilisateur
- Modifier le rôle d'un utilisateur
- Désactiver/Activer un utilisateur

#### 3.3.10 Paramètres

**Informations de contact modifiables** :
- Numéros de téléphone
- Adresses email
- Adresses physiques
- Liens réseaux sociaux
- Horaires généraux
- Informations générales de l'entreprise

**Gestion du compte administrateur** :
- Bouton pour modifier l'email administrateur
- Bouton pour modifier le mot de passe administrateur
- Code de sécurité requis : 3004202523091996

**Compte administrateur initial** :
- Email : immocongo@idriss.com
- Mot de passe : Idmozice@1996

## 4. Règles métier et logique

### 4.1 Gestion des promotions
- Une promotion est liée à un produit spécifique
- Le pourcentage de réduction est calculé automatiquement : ((ancien prix - nouveau prix) / ancien prix) × 100
- Une promotion a une date de début et une date de fin
- Les promotions expirées (date de fin < date actuelle) ne s'affichent plus sur le site public
- Lorsqu'un produit est en promotion, le prix promotionnel s'affiche à la place du prix normal

### 4.2 Gestion des commandes
- Une commande enregistre : client, produit, quantité, montant, ville, adresse, date, statut
- Le montant est calculé automatiquement : prix du produit × quantité
- Si le produit est en promotion, le prix promotionnel est utilisé
- Après enregistrement, un message WhatsApp pré-rempli est généré avec les informations de commande
- Les commandes peuvent être suivies et leur statut modifié par l'administration

### 4.3 Gestion des publications
- Une publication peut être en statut Brouillon, Publiée ou Programmée
- Les publications programmées s'affichent automatiquement à la date de publication définie
- Seules les publications publiées apparaissent sur le site public

### 4.4 Gestion des produits
- Un produit appartient à une catégorie et une marque
- Un produit peut avoir plusieurs photos
- Un produit peut être mis à la une pour apparaître en priorité sur l'accueil
- Un produit peut être publié ou dépublié (les produits dépubliés n'apparaissent pas sur le site public)
- Le statut de disponibilité est géré par le stock : stock > 0 = disponible, stock = 0 = rupture de stock

### 4.5 Gestion des utilisateurs et sécurité
- L'accès à l'espace d'administration nécessite une authentification
- Les permissions sont gérées par rôle :
  - Administrateur : accès complet
  - Éditeur : accès limité à produits, publications, promotions
  - Client : aucun accès à l'administration
- La modification de l'email ou du mot de passe administrateur nécessite le code de sécurité : 3004202523091996

### 4.6 Responsive et mobile-first
- Le site s'adapte automatiquement aux différentes tailles d'écran : smartphone, tablette, ordinateur, grand écran
- La navigation mobile est simplifiée et intuitive
- Les images sont optimisées pour un chargement rapide

### 4.7 SEO et référencement local
- Le site est optimisé pour les recherches locales : électroménager Congo, électroménager Brazzaville, électroménager Pointe-Noire, magasin électronique Congo, informatique Brazzaville
- Chaque page produit contient des métadonnées structurées
- Le site génère un sitemap et un fichier robots.txt

## 5. Cas exceptionnels et limites

| Situation | Comportement attendu |
|-----------|---------------------|
| Produit en rupture de stock | Affichage d'un badge \"Rupture de stock\", bouton Commander désactivé, possibilité de contacter Supersonic |
| Promotion expirée | La promotion disparaît automatiquement du site public, le produit revient au prix normal |
| Recherche sans résultat | Message \"Aucun produit trouvé\", suggestion de modifier les filtres |
| Commande avec quantité > stock | Validation bloquée, message d'erreur indiquant le stock disponible |
| Tentative d'accès à /admin sans authentification | Redirection vers la page de connexion |
| Utilisateur Éditeur tente d'accéder à la gestion des utilisateurs | Accès refusé, message d'erreur |
| Modification du compte admin sans code de sécurité | Action bloquée, message d'erreur |
| Upload d'image non valide | Validation bloquée, message d'erreur précisant les formats acceptés |
| Suppression d'une catégorie contenant des produits | Action bloquée ou réaffectation des produits à une autre catégorie |
| Suppression d'une marque contenant des produits | Action bloquée ou réaffectation des produits à une autre marque |

## 6. Critères de validation

1. Un visiteur accède à la page d'accueil et consulte les produits populaires
2. Le visiteur utilise la recherche pour trouver un produit spécifique (ex: réfrigérateur)
3. Le visiteur consulte la page détail du produit et clique sur Commander
4. Le visiteur remplit le formulaire de commande avec ses informations
5. La commande est enregistrée et le visiteur peut contacter Supersonic via WhatsApp avec un message pré-rempli
6. Un administrateur se connecte à l'espace d'administration
7. L'administrateur consulte la nouvelle commande dans la liste des commandes
8. L'administrateur modifie le statut de la commande en Confirmée

## 7. Fonctionnalités non incluses dans cette version

- Paiement en ligne intégré
- Système de panier avec gestion de session
- Compte client avec historique de commandes
- Système de notation et avis clients
- Programme de fidélité
- Comparateur de produits
- Liste de souhaits
- Chat en direct
- Notifications push
- Application mobile native
- Système de réservation de produits
- Gestion des stocks multi-magasins
- Système de facturation automatique
- Intégration avec un système de gestion de stock externe
- Système de recommandation personnalisée basé sur l'historique
- Gestion des retours et remboursements
- Système de suivi de livraison en temps réel
- Multi-devises
- Multi-langues