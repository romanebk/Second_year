# 🚀 Guide de Préparation à la Soutenance - Start Trek (Lunar Lander)

Ce document rassemble l'ensemble des concepts théoriques, mathématiques et techniques que tu dois maîtriser pour défendre ton projet d'Apprentissage par Renforcement (RL) avec succès.

---

## 1. Définition du Problème et Objectif
**L'objectif :** Entraîner un agent autonome capable de faire atterrir un module lunaire (LunarLander-v3) en toute sécurité, entre deux drapeaux, en minimisant la consommation de carburant et en évitant le crash.

**Pourquoi c'est un problème d'Apprentissage par Renforcement ?**
Le module n'a pas de trajectoire préprogrammée. Il doit apprendre par *essais et erreurs* en interagissant avec l'environnement. Les conséquences de ses actions (crash ou atterrissage réussi) peuvent survenir plusieurs étapes après l'action initiale (problème d'assignation du crédit / *credit assignment problem*).

---

## 2. Le Cadre Mathématique : MDP (Processus de Décision Markoviens)
L'Apprentissage par Renforcement formalise le problème sous forme de MDP : $(S, A, P, R, \gamma)$.
Tu dois savoir expliquer à quoi correspond chaque terme dans le contexte de Lunar Lander :
*   **$S$ (États / States) :** Vecteur continu de taille 8 décrivant le vaisseau.
    *   Coordonnées $(x, y)$, vitesses $(v_x, v_y)$, angle $\theta$, vitesse angulaire, et deux booléens pour le contact des pieds au sol.
*   **$A$ (Actions) :** Espace discret de taille 4.
    *   0: Ne rien faire, 1: Moteur gauche, 2: Moteur principal, 3: Moteur droit.
*   **$P$ (Fonction de transition) :** Gérée par le moteur physique de l'environnement (Box2D). Elle détermine le prochain état $S_{t+1}$ selon $S_t$ et $A_t$. *En RL Model-Free (comme ici), l'agent ne connaît pas cette fonction.*
*   **$R$ (Récompense / Reward) :** Signal scalaire à maximiser.
    *   Positif : Se rapprocher du sol, atterrir (+100).
    *   Négatif : S'écraser (-100), utiliser le moteur principal (pénalité de carburant).
*   **$\gamma$ (Facteur d'escompte / Discount Factor) :** Généralement 0.99. Détermine l'importance des récompenses futures par rapport aux récompenses immédiates.

---

## 3. Les Algorithmes d'Apprentissage

### A. Q-Learning (L'agent simple)
*   **Famille :** *Value-based*, *Off-policy* (hors-politique).
*   **Concept :** Il cherche à apprendre la fonction $Q(s, a)$, c'est-à-dire "Quelle est l'espérance des récompenses futures si je suis dans l'état $s$ et que je fais l'action $a$ ?".
*   **Équation de Bellman :**
    $Q(s, a) \leftarrow Q(s, a) + \alpha \left[ R + \gamma \max_{a'} Q(s', a') - Q(s, a) \right]$
*   **Limite pour LunarLander :** Le Q-learning classique utilise un tableau (Table Q) pour stocker les valeurs. C'est **impossible ici car l'espace d'état est continu** (infinité de positions/vitesses). Il faut soit discrétiser l'espace, soit utiliser le DQN.

### B. DQN (Deep Q-Network) (L'agent avancé)
*   **Concept :** Utilise un réseau de neurones artificiels pour approcher la fonction $Q(s, a)$ au lieu d'un tableau.
*   **Innovations majeures (CRUCIAL POUR LA DÉFENSE) :**
    1.  **Replay Buffer (Mémoire d'expérience) :** Stocke les transitions $(s, a, r, s', done)$. Lors de l'entraînement, on tire des *batchs* aléatoires de cette mémoire.
        *   *Pourquoi ?* Cela casse la forte corrélation entre les états consécutifs (qui déstabilise le réseau) et permet de réutiliser les expériences passées pour plus d'efficacité (data efficiency).
    2.  **Target Network (Réseau Cible) :** On utilise deux réseaux. Le réseau principal (qui apprend) et le réseau cible (qui donne la valeur cible $Y = R + \gamma \max Q_{target}$). Le réseau cible est mis à jour lentement (ou tous les $N$ pas).
        *   *Pourquoi ?* Évite que la cible "bouge" à chaque étape, ce qui provoquerait des oscillations divergentes (comme un chien qui chasse sa propre queue).

### C. (Optionnel) PPO (Proximal Policy Optimization)
Si tu as implémenté PPO, c'est l'état de l'art actuel.
*   **Famille :** *Policy Gradient* / *Actor-Critic*, *On-policy*.
*   **Concept :** Au lieu d'apprendre la valeur $Q$, PPO apprend directement la politique $\pi(a|s)$ (le réseau "Acteur") et estime la valeur de l'état $V(s)$ (le réseau "Critique").
*   **Atout majeur :** Le "Clipping". PPO limite l'ampleur des mises à jour du réseau à chaque étape pour éviter de détruire une politique qui commence à bien fonctionner.

---

## 4. Concepts Clés de la Pratique

### Exploration vs Exploitation
*   **Dilemme :** L'agent doit-il choisir la meilleure action qu'il connaît (Exploitation) ou essayer une nouvelle action au hasard pour découvrir peut-être une meilleure stratégie (Exploration) ?
*   **Solution ($\epsilon$-greedy) :** Avec une probabilité $\epsilon$, l'agent prend une action au hasard. Sinon, il prend $\max_a Q(s, a)$.
*   **Epsilon Decay :** Au début, $\epsilon = 1.0$ (100% d'exploration). Au fil des épisodes, on le diminue jusqu'à un minimum (ex: $\epsilon = 0.01$).

### Reproductibilité et "Seeds" (Graines Aléatoires)
*   **Pourquoi fixer les seeds ?** Les algorithmes RL sont très instables et dépendent énormément de l'initialisation des poids du réseau et de l'aléatoire de l'environnement. Fixer la seed permet de garantir que n'importe qui (ou le prof) relançant ton script aura **exactement la même courbe d'apprentissage**.
*   **Pourquoi faire 5 seeds différentes ?** Une bonne exécution sur *une seule* seed peut être un coup de chance. Faire la moyenne sur 5 seeds différentes avec un **Intervalle de Confiance (IC 95%)** prouve que ton algorithme est intrinsèquement robuste et ne dépend pas d'un tirage chanceux.

---

## 5. Protocole d'Évaluation et Analyse des Résultats

En RL, prouver qu'un agent fonctionne nécessite une rigueur scientifique stricte. Voici comment tu dois mener et analyser tes évaluations :

### A. Les Règles d'une bonne Évaluation (Le Protocole)
1.  **Séparation Entraînement / Évaluation :** 
    *   *Pendant l'entraînement*, l'agent explore activement ($\epsilon > 0$).
    *   *Pendant l'évaluation*, tu dois geler l'apprentissage (pas de backpropagation) et **couper l'exploration** ($\epsilon = 0$, politique purement *déterministe* : `action = argmax(Q(s,a))`). On n'évalue jamais les performances d'un agent avec un $\epsilon$ élevé.
2.  **Moyenne Glissante (Moving Average) :** Les courbes de scores par épisode sont par nature très "bruitées" (oscillations fortes). Tu dois toujours appliquer un lissage (moyenne glissante sur 50 ou 100 épisodes) sur tes graphiques pour rendre la tendance globale lisible.
3.  **Le Seuil de Résolution ("Solved Threshold") :** Pour l'environnement *LunarLander-v3*, la documentation officielle considère le problème comme résolu quand l'agent atteint **un score moyen supérieur ou égal à +200 sur 100 épisodes consécutifs**. C'est le Graal à atteindre et la ligne horizontale à tracer sur tes graphiques.
4.  **Métriques Additionnelles :** Ne trace pas que le score global. Il est très valorisé de mesurer et tracer :
    *   Le *Taux de Succès (Win Rate)* : Le pourcentage d'atterrissages réussis entre les drapeaux vs les crashs/timeouts.
    *   La *Durée des épisodes (Episode Length)* : Vérifier que l'agent ne trouve pas une faille (un "local optima") pour simplement flotter dans les airs à l'infini.

### B. Analyser tes Courbes (Ce que le jury va regarder)
1.  **L'Évaluation Multi-Seeds et l'Intervalle de Confiance (IC 95%) :** C'est le point central de la robustesse. Tu dois entraîner au moins 5 agents indépendants de zéro. Le graphique final superpose ces 5 exécutions : la ligne pleine est la moyenne, l'ombre colorée autour est la variance ou l'IC 95%.
    *   *Si l'enveloppe est large* : Ton algorithme est instable, il dépend beaucoup du hasard de l'initialisation.
    *   *Si l'enveloppe est étroite et monte vers les +200* : Ton agent est extrêmement robuste.
2.  **Comparaison avec les Baselines :** 
    *   *Baseline Random* : Prouve que le problème n'est pas trivial.
    *   *Baseline Heuristique* : Montre l'intelligence humaine basique. Un bon DQN/PPO doit croiser la courbe de l'heuristique et la dépasser largement pour prouver que l'IA a "découvert" une stratégie supérieure à un simple `if/else`.
3.  **Critique Objective (Les Limites) :** Ne dis jamais que ton agent est parfait. Explique ses failles possibles : l'effondrement soudain des performances après une longue période d'apprentissage ("Catastrophic Forgetting"), la lenteur d'apprentissage, ou l'hyper-sensibilité de la perte (*Loss*) face aux taux d'apprentissage.

---

## 6. Questions Typiques du Jury (Questions Pièges)

*   **"Quelle est la différence entre On-policy et Off-policy ?"**
    *   *Réponse :* **On-policy** (ex: PPO, SARSA) évalue et améliore la politique qui est *actuellement utilisée* pour prendre des décisions. Les données doivent être jetées après chaque mise à jour. **Off-policy** (ex: Q-Learning, DQN) peut apprendre à partir de données générées par une politique plus ancienne ou aléatoire (grâce au Replay Buffer).
*   **"Pourquoi utiliser l'erreur quadratique moyenne (MSE) ou la Huber Loss pour le DQN ?"**
    *   *Réponse :* La Huber Loss (Smooth L1 Loss) est préférable car elle réagit moins violemment aux grandes erreurs, ce qui évite l'explosion du gradient (très fréquente en RL au début de l'entraînement quand les estimations $Q$ sont mauvaises).
*   **"Si l'agent n'apprend pas, quels hyperparamètres modifies-tu en premier ?"**
    *   *Réponse :* Le Learning Rate (taux d'apprentissage) s'il est trop haut le réseau diverge. La taille du Batch. Ou la vitesse de diminution d'Epsilon (peut-être qu'il arrête d'explorer trop tôt).
*   **"À quoi sert le facteur d'escompte $\gamma$ (gamma) ?"**
    *   *Réponse :* Si $\gamma = 0$, l'agent ne pense qu'au gain immédiat (myope). Si $\gamma \approx 1$ (ex: 0.99), l'agent planifie sur le long terme. Dans LunarLander, on a besoin d'un $\gamma$ proche de 1 car la récompense principale (+100) n'arrive qu'à la toute fin de l'épisode.

---

## 7. Plan Recommandé pour la Présentation Orale (Démo + Slides)
Une bonne présentation doit être claire, visuelle et montrer que tu maîtrises le sujet (pas seulement lire des slides).

*   **Slide 1 : Introduction & Objectif :** Présente le problème LunarLander, montre une petite vidéo de l'agent aléatoire (la baseline random qui s'écrase). Pose l'objectif mesurable (ex: "Atteindre un score moyen > 200 sur 100 épisodes").
*   **Slide 2 : Cadre Théorique (MDP) :** Décris brièvement l'État, l'Action, la Récompense. Montre que tu as formalisé le problème mathématiquement.
*   **Slide 3 : Les Algorithmes Choisis :** Présente le Q-Learning classique (ses limites) et l'algorithme avancé que tu as implémenté (DQN ou PPO). Explique *visuellement* (avec un schéma, pas de code) comment fonctionne le Replay Buffer ou l'architecture du réseau.
*   **Slide 4 : Résultats et Comparaison :** Affiche tes graphiques (Courbes d'apprentissage sur 5 seeds avec Intervalle de Confiance). Compare les performances avec l'heuristique et le random. Commente : "L'agent dépasse l'heuristique après X épisodes".
*   **Slide 5 : Démo & Robustesse :** Montre une vidéo de ton meilleur agent. Explique comment tu as validé sa robustesse (tests sur plusieurs seeds, reproductibilité one-click).
*   **Slide 6 : Limites & Plan d'Amélioration :**
    *   *Limites :* Instabilité en début d'entraînement, temps de calcul, hyperparamètres difficiles à tuner.
    *   *Améliorations (Basées sur les données) :* "Nos courbes montrent une forte variance, on pourrait ajouter un Prioritized Experience Replay (PER) au DQN, ou tester un algorithme plus stable comme PPO".
*   **Slide 7 : Conclusion :** Bilan mesurable de la réussite du projet.

## 8. Bonnes Pratiques Logiciel & Reproductibilité (À mettre en avant)
L'évaluation portera aussi sur tes pratiques de développement. Tu dois être capable d'expliquer :
*   **Packaging / Installable :** Comment l'utilisation de `requirements.txt` permet à n'importe qui d'installer l'environnement.
*   **Format/Linting :** Indiquer que tu as utilisé des outils (comme `flake8`, `black` ou `pylint`) pour avoir un code propre.
*   **Scripts Reproductibles (One-Click) :** Le fait d'avoir un script (comme `scripts/reproduce.py` ou via un `Makefile`) qui lance l'entraînement complet sur 5 seeds avec les paramètres YAML sans configuration manuelle.

## 9. Le Rapport (Checklist Rapide)
Pour le rapport PDF (4-6 pages), assure-toi que ces éléments y figurent absolument :
*   [ ] **Introduction :** Contexte et définition de la réussite.
*   [ ] **Cadre Mathématique :** Formulation exacte du MDP.
*   [ ] **Expériences & Résultats :** Graphiques avec les fameux *IC 95%*, comparaison baselines.
*   [ ] **Analyse Critique :** Qu'est-ce qui a marché ? Qu'est-ce qui a bloqué (ex: tuning du learning rate) ?
*   [ ] **Plan d'amélioration :** Proposer PPO si tu as fait DQN, ou PER, Dueling DQN, etc.
*   [ ] **Formules clés :** Bellman, fonction de Loss avec une belle mise en forme.
*   [ ] **Bibliographie :** Citer le papier originel du DQN (Mnih et al., 2015), la doc Gymnasium, etc.

---
**Rappel Final :** L'honnêteté intellectuelle paie. Si un algo n'a pas bien marché ou qu'une courbe n'est pas belle, explique *pourquoi* selon toi, et comment tu as tenté de le corriger. L'analyse critique est l'une des compétences les plus attendues !

---

## 10. Glossaire de Survie (Vocabulaire à maîtriser)
Si tu utilises un terme, tu dois pouvoir le définir.
*   **Step (Pas) :** Une itération de l'environnement (une observation, un choix d'action, une récompense, un nouvel état).
*   **Episode :** Une séquence d'interactions complète, du début (vaisseau généré en haut) à un état terminal (crash, atterrissage réussi, ou timeout).
*   **Transition :** Le tuple de données $(S_t, A_t, R_t, S_{t+1}, Done)$ généré à chaque step. C'est l'unité de base de l'apprentissage.
*   **Loss (Fonction de perte) :** L'erreur mesurée que le réseau de neurones essaie de minimiser (la différence entre la valeur Q prédite par le réseau et la valeur Q cible calculée avec Bellman).
*   **Policy (Politique - $\pi$) :** La stratégie de l'agent. C'est une fonction qui prend un état en entrée et donne l'action à effectuer.
*   **Value Function ($V(s)$ ou $Q(s,a)$) :** L'estimation de la somme des récompenses futures (le score total) qu'on peut espérer atteindre depuis un état donné.

## 11. Comment défendre ton code (Code Walkthrough)
Le jury te demandera très probablement d'ouvrir ton code (`train.py` ou le fichier de ton agent) et d'expliquer certaines lignes. Tu dois être capable de repérer ces 4 éléments instantanément :
1.  **La boucle d'interaction :** Repérer la ligne `next_state, reward, done, _, _ = env.step(action)`. C'est là que l'agent interagit avec l'environnement.
2.  **Le "Forward Pass" (Inférence) :** Où le réseau prend l'état en entrée et sort les valeurs des actions : `q_values = model(state)`. C'est ce qui sert à choisir l'action (en prenant le max).
3.  **Le "Backward Pass" (Apprentissage) :** Où l'erreur est calculée et les poids du réseau sont mis à jour : `loss.backward()` suivi de `optimizer.step()`.
4.  **Le Replay Buffer :** Savoir montrer la méthode où tu ajoutes les expériences `buffer.push(state, action, reward, next_state, done)` et celle où tu tires un lot d'expériences au hasard pour entraîner le réseau `batch = buffer.sample(batch_size)`.

🎉 **Bon courage pour ta soutenance !** Si tu maîtrises les concepts de ce document et que tu as codé/entraîné ton agent, l'oral se passera très bien.
