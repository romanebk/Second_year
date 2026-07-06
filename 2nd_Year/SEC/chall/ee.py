def convertir_gros_fichier_binaire(fichier_entree, fichier_sortie, taille_tampon=65536):
    """
    Convertit un fichier binaire géant (bits 0/1) en fichier binaire réel.
    Lit par morceaux et écrit le résultat au fur et à mesure.
    """
    reste = ""
    
    try:
        with open(fichier_entree, 'r', encoding='utf-8') as f_in, \
             open(fichier_sortie, 'wb') as f_out:
                 
            while True:
                morceau = f_in.read(taille_tampon)
                if not morceau:
                    break
                
                bits = (reste + morceau).replace(' ', '').replace('\n', '')
                
                reste = ""
                octets = []
                for i in range(0, len(bits), 8):
                    bloc = bits[i:i+8]
                    if len(bloc) == 8:
                        octets.append(int(bloc, 2))
                    else:
                        reste = bloc
                
                f_out.write(bytes(octets))
            
            if reste:
                reste = reste.ljust(8, '0')
                f_out.write(bytes([int(reste, 2)]))
                
        print(f"Conversion terminée avec succès ! Résultat enregistré dans : {fichier_sortie}")
        
    except FileNotFoundError:
        print("Erreur : Le fichier d'entrée est introuvable.")
    except ValueError:
        print("Erreur : Présence de caractères non binaires ou mal formés.")

if __name__ == "__main__":
    import sys
    if len(sys.argv) != 3:
        print("Usage: python3 ee.py <fichier_entree> <fichier_sortie>")
        print("Exemple: python3 ee.py digits.bin output.jpg")
    else:
        convertir_gros_fichier_binaire(sys.argv[1], sys.argv[2])
