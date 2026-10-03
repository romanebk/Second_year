#!/bin/bash

case "$1" in
  up)
    docker-compose up -d
    sleep 2
    xdg-open http://localhost:5678 2>/dev/null || \
      open http://localhost:5678 2>/dev/null || \
      echo "→ Ouvre http://localhost:5678 dans ton navigateur"
    ;;
  down)
    echo "→ Arrêt de n8n..."
    docker exec n8n sh -c "kill \$(pgrep -f '/usr/local/bin/n8n')" 2>/dev/null || true
    for i in $(seq 1 10); do
      docker ps --filter name=n8n --format '{{.Status}}' | grep -q Up || break
      sleep 1
    done
    docker-compose down 2>&1 || true
    ;;
  restart)
    $0 down
    $0 up
    ;;
  logs)
    docker logs -f n8n
    ;;
  status)
    echo "→ n8n : $(docker ps --filter name=n8n --format '{{.Status}}')"
    ;;
  *)
    echo "Usage: ./persona.sh {up|down|restart|logs|status}"
    ;;
esac
