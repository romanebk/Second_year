#!/usr/bin/env bash
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

dry_run=false
if [[ ${1:-} == "--dry-run" ]]; then
  dry_run=true
fi

branch=$(git branch --show-current)
if [[ -z "$branch" ]]; then
  echo "Erreur : impossible de déterminer la branche courante."
  exit 1
fi

commit_action() {
  local code="$1"
  case "$code" in
    "??") echo "Add";;
    "A "|"A?"|"M "|"MM"|"AM"|"??") echo "Add";;
    " M"|"MM"|"AM"|"RM") echo "Update";;
    " D"|"D ") echo "Remove";;
    R? ) echo "Rename";;
    *) echo "Update";;
  esac
}

commit_subject() {
  local path="$1"
  local action="$2"
  case "$path" in
    zappy_gui/src/core/main.cpp)
      echo "$action application entry point"
      ;;
    zappy_gui/src/core/App.*)
      echo "$action application core"
      ;;
    zappy_gui/src/core/SharedState.*)
      echo "$action shared state definition"
      ;;
    zappy_gui/src/network/NetworkThread.*)
      echo "$action network thread"
      ;;
    zappy_gui/src/network/Network.*)
      echo "$action network connection"
      ;;
    zappy_gui/src/network/Buffer.*)
      echo "$action buffered I/O helper"
      ;;
    zappy_gui/src/network/CommandQueue.*)
      echo "$action command queue"
      ;;
    zappy_gui/src/parser/Parser.*)
      echo "$action protocol parser"
      ;;
    zappy_gui/src/parser/CommandHandlers.*)
      echo "$action command handlers"
      ;;
    zappy_gui/src/parser/Protocol.*)
      echo "$action protocol definitions"
      ;;
    zappy_gui/src/renderer/MapRenderer.*)
      echo "$action map renderer"
      ;;
    zappy_gui/src/renderer/EntityRenderer.*)
      echo "$action entity renderer"
      ;;
    zappy_gui/src/renderer/Camera.*)
      echo "$action camera controls"
      ;;
    zappy_gui/src/renderer/Shader.*)
      echo "$action shader wrapper"
      ;;
    zappy_gui/src/renderer/Renderer.*)
      echo "$action renderer core"
      ;;
    zappy_gui/src/renderer/RenderThread.*)
      echo "$action render thread"
      ;;
    zappy_gui/src/hud/HUD.*)
      echo "$action HUD overlay"
      ;;
    zappy_gui/src/hud/TeamPanel.*)
      echo "$action team panel"
      ;;
    zappy_gui/src/hud/PlayerPanel.*)
      echo "$action player panel"
      ;;
    zappy_gui/src/state/GameState.*)
      echo "$action game state model"
      ;;
    zappy_gui/src/state/Tile.*)
      echo "$action tile model"
      ;;
    zappy_gui/src/state/Player.*)
      echo "$action player model"
      ;;
    zappy_gui/src/state/Team.*)
      echo "$action team model"
      ;;
    zappy_gui/src/state/Egg.*)
      echo "$action egg model"
      ;;
    zappy_gui/assets/*)
      echo "$action GUI assets"
      ;;
    README*|*.md)
      echo "$action documentation"
      ;;
    *.sh)
      echo "$action shell helper"
      ;;
    *.txt)
      echo "$action text resource"
      ;;
    *)
      local file="$(basename "$path")"
      echo "$action $file"
      ;;
  esac
}

parse_status_entries() {
  local -n _paths=$1
  local -n _codes=$2
  local -n _origins=$3

  mapfile -d '' -t raw_entries < <(git status --short --untracked-files=all --porcelain=1 -z)
  local i=0
  while [[ $i -lt ${#raw_entries[@]} ]]; do
    local entry="${raw_entries[i]}"
    i=$((i + 1))
    [[ -z "$entry" ]] && continue
    local code="${entry:0:2}"
    local path="${entry:3}"

    if [[ "$code" =~ ^R ]]; then
      local old_path="$path"
      if [[ $i -lt ${#raw_entries[@]} ]]; then
        local new_path="${raw_entries[i]}"
        i=$((i + 1))
        _paths+=("$new_path")
        _codes+=("$code")
        _origins+=("$old_path")
      else
        _paths+=("$old_path")
        _codes+=("$code")
        _origins+=("")
      fi
    else
      _paths+=("$path")
      _codes+=("$code")
      _origins+=("")
    fi
  done
}

files=()
codes=()
origins=()
parse_status_entries files codes origins

if [[ ${#files[@]} -eq 0 ]]; then
  echo "Aucun changement à committer ou à pousser."
  exit 0
fi

commit_count=0
for idx in "${!files[@]}"; do
  path="${files[idx]}"
  code="${codes[idx]}"
  origin="${origins[idx]}"
  action="$(commit_action "$code")"
  subject="$(commit_subject "$path" "$action")"

  echo "Processing: $path ($code)"
  if [[ "$dry_run" == true ]]; then
    echo "  Commit: $subject"
    continue
  fi

  case "$code" in
    "??")
      git add -- "$path"
      ;;
    "A "|"A?"|"M "|"MM"|"AM"|"RM")
      git add -- "$path"
      ;;
    " D"|"D ")
      git rm -- "$path"
      ;;
    R?)
      if [[ -n "$origin" ]]; then
        git add -A -- "$origin" -- "$path"
      else
        git add -- "$path"
      fi
      ;;
    *)
      git add -- "$path"
      ;;
  esac

  if [[ "$code" == " D" || "$code" == "D " ]]; then
    git commit -m "$subject"
  else
    git commit -m "$subject" -- "$path"
  fi
  commit_count=$((commit_count + 1))
  echo "  Committed: $subject"
done

if [[ "$dry_run" == true ]]; then
  echo "Dry run: git push origin $branch"
  exit 0
fi

if [[ $commit_count -gt 0 ]]; then
  echo "Pushing $commit_count commit(s) to origin/$branch..."
  git push origin "$branch"
  echo "Push terminé."
else
  echo "Aucun commit créé."
fi
