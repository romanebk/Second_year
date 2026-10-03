## 0. Bug Bounty

Le bug bounty (ou prime aux bogues) est un programme de cybersécurité où une entreprise propose une récompense financière aux hackers éthiques qui découvrent et signalent des failles de sécurité dans leurs systèmes. Cela permet d'améliorer la sécurité avant qu'ils ne soient exploités par des pirates malveillants.
# Concepts fondamentaux de l'exploitation binaire

Ce document présente les concepts essentiels de l’exploitation binaire (Binary Exploitation ou pwn en cybersécurité). Ils expliquent comment un attaquant peut prendre le contrôle d’un programme en manipulant sa mémoire.

## 1. Buffer Overflow (Dépassement de tampon)
Une faille où un programme écrit plus de données dans une zone de mémoire (le tampon) qu’elle ne peut en contenir. Les données supplémentaires débordent et écrasent les zones mémoire voisines, permettant de corrompre le fonctionnement du programme.

## 2. RIP
Le registre d’un processeur (sur les systèmes 64 bits) qui indique toujours la prochaine instruction à exécuter. C’est le « cerveau » du pointeur d’instruction. Le modifier permet de forcer l’ordinateur à exécuter du code choisi par l’attaquant.

## 3. Payload
La « charge utile ». C’est le bloc de données (souvent une suite de caractères) envoyé au programme pour l’exploiter. Il est conçu pour remplir le buffer, écraser les registres et rediriger le flux d’exécution.

## 4. ASLR (Address Space Layout Randomization)
Une mesure de sécurité du système d’exploitation qui change aléatoirement l’emplacement des fonctions et des données en mémoire à chaque exécution, rendant les attaques plus difficiles car l’attaquant ne connaît pas les adresses exactes à l’avance.


## 5. ret2win
Un type d’attaque (ou de défi d’apprentissage) consistant à écraser l’adresse de retour pour forcer le programme à sauter vers une fonction cachée et utile (la fonction « win »), qui donne par exemple un accès direct aux privilèges du système ou un drapeau (flag dans les CTF).

## 6. PIE et Stack Canaries

En cybersécurité, PIE (Position Independent Executable) et les Stack Canaries (canaris de pile) sont deux protections fondamentales intégrées lors de la compilation d'un programme (souvent en C/C++). Elles servent à bloquer les attaques par corruption de mémoire, comme les dépassements de tampon (buffer overflows).

🛡️ **Les Stack Canaries (Canaris de pile)**
Le nom vient des canaris utilisés autrefois dans les mines pour détecter les gaz toxiques.
**Le principe** : Le compilateur place une valeur secrète et aléatoire (le canari) dans la mémoire, juste entre les variables locales et l'adresse de retour de la fonction.
**Le fonctionnement** : Si un attaquant tente de déborder d'un tampon pour modifier l'adresse de retour, il écrase obligatoirement le canari. Avant de quitter la fonction, le programme vérifie si le canari a changé. Si c'est le cas, le programme s'arrête immédiatement pour éviter l'exécution de code malveillant.
**La faille** : Un attaquant peut contourner cette sécurité s'il trouve une fuite de mémoire (comme une faille de chaîne de format / format string) qui lui révèle la valeur du canari. Il lui suffit alors de réécrire le canari avec sa propre valeur exacte.

🗺️ **PIE (Position Independent Executable)**
**Le principe** : Cette option de compilation permet de charger le code du programme à n'importe quel endroit de la mémoire.
**Le fonctionnement** : Combiné avec l'ASLR (Address Space Layout Randomization) du système d'exploitation, PIE rend l'emplacement des fonctions et des variables totalement imprévisible à chaque démarrage du programme. Un attaquant ne peut donc plus utiliser d'adresses mémoires fixes pour rediriger l'exécution du code.

## 7. ASLR (Address Space Layout Randomization)

L'acronyme ASLR peut désigner deux notions principales en français : en informatique, il s'agit de la Randomisation de l'espace d'adressage, et en kinésithérapie, du test d'élévation de la jambe tendue.

1. Informatique : Address Space Layout Randomization
En cybersécurité et en programmation, l'ASLR (traduit par « distribution aléatoire de l'espace d'adressage ») est un mécanisme de défense de la mémoire.

Fonctionnement : Cette technique place de façon aléatoire les zones de données clés d'un programme (comme la pile, le tas et les bibliothèques) dans la mémoire virtuelle du système.

Utilité : Elle empêche les pirates informatiques de prédire l'emplacement des fonctions et du code du système. Cela neutralise ou limite considérablement de nombreuses attaques, notamment celles basées sur les dépassements de mémoire tampon (buffer overflows).

Pour des conseils visuels sur l'importance de ce mécanisme et sur la façon dont les systèmes d'exploitation protègent la mémoire

## 8. Stack (Pile) et Heap (Tas)

En programmation, le Stack (la pile) et le Heap (le tas) sont deux zones de la mémoire vive (RAM) utilisées pour stocker les données lors de l'exécution d'un programme.

Le Stack gère les variables locales et les appels de fonctions de manière séquentielle et ultra-rapide, avec une taille limitée. Le Heap gère l'allocation dynamique pour les objets complexes ou globaux qui doivent persister. Il est plus flexible en taille, mais plus lent à gérer.

Voici les détails et critères de comparaison clés :

1. Organisation et vitesse
Stack (Pile) : Fonctionne sur le principe du "dernier arrivé, premier sorti" (LIFO). Les données s'empilent et se dépilent automatiquement. L'accès à la mémoire est extrêmement rapide.
Heap (Tas) : La mémoire n'est pas organisée de manière stricte. Les données peuvent être placées et récupérées n'importe où, ce qui le rend plus lent en termes de lecture et d'écriture.

2. Gestion et cycle de vie
Stack : Géré automatiquement par le processeur et le compilateur. Dès qu'une fonction se termine, toutes les variables locales créées dans cette fonction sont automatiquement supprimées.
Heap : Géré dynamiquement par le programmeur ou par un gestionnaire de mémoire (comme le Garbage Collector en Java ou Python). Les données persistent jusqu'à ce qu'elles soient explicitement supprimées ou libérées.

3. Taille et accessibilité
Stack : La taille est fixe et généralement petite. Si vous stockez trop de données (par exemple, dans une fonction récursive sans fin), vous provoquez une erreur de type Stack Overflow.
Heap : Sa taille dépend de la mémoire disponible sur votre machine. Il est idéal pour stocker de grandes structures de données (listes, arbres, objets volumineux).

## 9. Drop Shell

Un "drop shell" fait généralement référence à deux concepts bien distincts selon le contexte, l'un en informatique (sécurité) et l'autre dans le domaine des accessoires ou de la mode :

1. En Informatique et Cybersécurité
Bien qu'on utilise plus couramment le terme de "reverse shell", un "drop shell" ou "shell inversé" désigne une technique d'attaque où un pirate informatique pousse une machine distante (souvent compromise) à établir une connexion directe vers l'ordinateur de l'attaquant, afin d'en prendre le contrôle. Vous pouvez vous référer à la page Reverse shell - Wikipédia pour en comprendre les détails techniques.