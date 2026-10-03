# Installation de N8N avec Docker


## 1. Installer Docker

```bash
# 1. Installer Docker proprement
sudo apt-get update
sudo apt-get install -y docker.io

# 2. Créer le groupe docker et y ajouter ton user
sudo groupadd docker
sudo usermod -aG docker $USER

# 3. Démarrer le service Docker
sudo systemctl enable docker
sudo systemctl start docker

# 4. Recharger le groupe sans redémarrer
newgrp docker
```

### Vérifier l'installation

```bash
# Vérifier que Docker tourne bien
sudo systemctl status docker

# Vérifier que ton user est dans le groupe docker
groups $USER
```

jt2fd026*A25wzjyn2FF

mistral : PxolI79HSeG5Gmoa20HSmd0Qp60oLfoB

google: 787348756512-5asln4mjqobd5b1ov5fab91kdevesug7.apps.googleusercontent.com

ollama conifg password : paet pbrc wofn bbyp

## 2. Lancer N8N

```bash
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  docker.n8n.io/n8nio/n8n
```

## Utilisation

Ouvrez votre navigateur et rendez-vous sur :

```
http://localhost:5678
```

## Troubleshooting

### `network is unreachable` au lancement de N8N

**Cause :** Docker tente de se connecter via IPv6, mais l'IPv6 n'est pas accessible sur votre réseau.

**Solution :** Désactiver l'IPv6 dans la config Docker.

```bash
# 1. Créer le fichier de configuration
sudo tee /etc/docker/daemon.json > /dev/null <<'EOF'
{
  "fixed-cidr-v6": "",
  "ipv6": false
}
EOF

# 2. Redémarrer Docker
sudo systemctl restart docker

# 3. Relancer le conteneur
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  docker.n8n.io/n8nio/n8n
```

### Autres vérifications réseau

```bash
# Tester la connexion à Docker Hub (IPv4)
curl -I https://registry-1.docker.io

# Tester la connexion à N8N
curl -I https://docker.n8n.io

# Vérifier les DNS utilisés
resolvectl status
```
