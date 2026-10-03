#!/usr/bin/env python3
# test_integration.py - Tests d'intégration (nécessite un serveur Zappy)

import sys
import subprocess
import time
import socket

def est_port_ouvert(host, port):
    """Vérifie si un port est ouvert"""
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(1)
        resultat = sock.connect_ex((host, port))
        sock.close()
        return resultat == 0
    except:
        return False


def test_connexion_basique():
    """Test de connexion simple au serveur"""
    print("Test: Connexion basique au serveur")
    
    if not est_port_ouvert("localhost", 4242):
        print("  ⚠ SKIP: Aucun serveur sur localhost:4242")
        print("  Lancez un serveur Zappy avec: ./zappy_server -p 4242 -x 10 -y 10 -n team1 -c 5 -f 100")
        return False
    
    try:
        from reseau import Reseau, ReseauException
        
        print("  → Connexion...")
        reseau = Reseau("localhost", 4242, "team1", timeout_connexion=3.0)
        
        print(f"  ✓ Connecté ! Places: {reseau.places}, Carte: {reseau.taille}")
        
        # Test slots
        assert reseau.slots_disponibles == 10, "Slots initiaux != 10"
        print(f"  ✓ Slots initiaux: {reseau.slots_disponibles}")
        
        # Test vivant
        assert reseau.est_vivant(), "Joueur devrait être vivant"
        print("  ✓ Joueur vivant")
        
        reseau.fermer()
        print("  ✓ Connexion fermée proprement")
        return True
        
    except ReseauException as e:
        print(f"  ✗ Erreur: {e}")
        return False


def test_commandes_basiques():
    """Test des commandes de base"""
    print("\nTest: Commandes basiques")
    
    if not est_port_ouvert("localhost", 4242):
        print("  ⚠ SKIP: Aucun serveur disponible")
        return False
    
    try:
        from reseau import Reseau
        
        reseau = Reseau("localhost", 4242, "team1", timeout_connexion=3.0)
        print("  → Connecté")
        
        # Test Forward
        print("  → Envoi Forward...")
        reseau.envoyer_commande("Forward")
        assert reseau.slots_disponibles == 9, f"Slots après envoi: {reseau.slots_disponibles} != 9"
        print(f"  ✓ Commande envoyée (slots: {reseau.slots_disponibles})")
        
        reponse = reseau.recevoir_reponse()
        print(f"  ✓ Réponse reçue: {reponse!r}")
        assert reseau.slots_disponibles == 10, f"Slots après réception: {reseau.slots_disponibles} != 10"
        
        # Test Look
        print("  → Envoi Look...")
        reseau.envoyer_commande("Look")
        reponse = reseau.recevoir_reponse()
        print(f"  ✓ Look: {reponse[:50]}...")
        
        vision = reseau.parse_vision(reponse)
        assert len(vision) > 0, "Vision vide"
        print(f"  ✓ Vision parsée: {len(vision)} cases")
        
        # Test Inventory
        print("  → Envoi Inventory...")
        reseau.envoyer_commande("Inventory")
        reponse = reseau.recevoir_reponse()
        print(f"  ✓ Inventory: {reponse[:50]}...")
        
        inventaire = reseau.parser_inventaire(reponse)
        assert 'food' in inventaire, "Pas de food dans l'inventaire"
        print(f"  ✓ Inventaire parsé: {dict(list(inventaire.items())[:3])}...")
        
        reseau.fermer()
        print("  ✓ Test terminé")
        return True
        
    except Exception as e:
        print(f"  ✗ Erreur: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_navigation():
    """Test du module navigation"""
    print("\nTest: Module navigation")
    
    if not est_port_ouvert("localhost", 4242):
        print("  ⚠ SKIP: Aucun serveur disponible")
        return False
    
    try:
        from reseau import Reseau
        from navigation import Navigateur, parser_look
        
        reseau = Reseau("localhost", 4242, "team1", timeout_connexion=3.0)
        navigateur = Navigateur(reseau)
        print("  → Navigateur créé")
        
        # Test regarder
        print("  → Appel regarder()...")
        vue = navigateur.regarder()
        print(f"  ✓ Vision enrichie: {len(vue)} cases")
        print(f"    Case 0: {vue[0]}")
        
        # Test déplacement simple
        print("  → Test aller_a_case(2) (pile devant)...")
        navigateur.aller_a_case(2)
        print("  ✓ Déplacement effectué")
        
        reseau.fermer()
        print("  ✓ Test navigation terminé")
        return True
        
    except Exception as e:
        print(f"  ✗ Erreur: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_file_commandes():
    """Test du remplissage de la file de commandes"""
    print("\nTest: File de commandes (10 slots)")
    
    if not est_port_ouvert("localhost", 4242):
        print("  ⚠ SKIP: Aucun serveur disponible")
        return False
    
    try:
        from reseau import Reseau, ReseauException
        
        reseau = Reseau("localhost", 4242, "team1", timeout_connexion=3.0)
        print("  → Connecté")
        
        # Remplir la file
        print("  → Envoi de 10 commandes...")
        for i in range(10):
            reseau.envoyer_commande("Inventory")
            print(f"    Commande {i+1}/10 - slots restants: {reseau.slots_disponibles}")
        
        assert reseau.slots_disponibles == 0, "File pas pleine"
        print("  ✓ File pleine (10/10)")
        
        # Tenter d'en envoyer une 11e
        print("  → Tentative d'envoi 11e commande...")
        try:
            reseau.envoyer_commande("Forward")
            print("  ✗ Pas d'exception levée !")
            return False
        except ReseauException as e:
            print(f"  ✓ Exception attendue: {e}")
        
        # Vider la file
        print("  → Vidage de la file...")
        for i in range(10):
            reseau.recevoir_reponse()
            print(f"    Réponse {i+1}/10 - slots libres: {reseau.slots_disponibles}")
        
        assert reseau.slots_disponibles == 10, "File pas vidée"
        print("  ✓ File vidée (10 slots disponibles)")
        
        reseau.fermer()
        print("  ✓ Test file terminé")
        return True
        
    except Exception as e:
        print(f"  ✗ Erreur: {e}")
        import traceback
        traceback.print_exc()
        return False


def main():
    print("=" * 60)
    print("TESTS D'INTÉGRATION ZAPPY AI")
    print("=" * 60)
    print()
    print("Ces tests nécessitent un serveur Zappy en écoute.")
    print("Commande suggérée:")
    print("  ./zappy_server -p 4242 -x 10 -y 10 -n team1 -c 10 -f 100")
    print()
    
    resultats = []
    
    resultats.append(("Connexion basique", test_connexion_basique()))
    resultats.append(("Commandes basiques", test_commandes_basiques()))
    resultats.append(("Navigation", test_navigation()))
    resultats.append(("File de commandes", test_file_commandes()))
    
    print("\n" + "=" * 60)
    print("RÉSULTATS")
    print("=" * 60)
    
    reussis = 0
    for nom, resultat in resultats:
        statut = "✓ PASS" if resultat else "✗ FAIL"
        print(f"{statut} - {nom}")
        if resultat:
            reussis += 1
    
    print(f"\nTotal: {reussis}/{len(resultats)} tests réussis")
    
    return 0 if reussis == len(resultats) else 1


if __name__ == "__main__":
    sys.exit(main())
