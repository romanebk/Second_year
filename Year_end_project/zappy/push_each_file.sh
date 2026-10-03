#!/usr/bin/env bash
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

dry_run=false
if [[ ${1:-} == "--dry-run" ]]; then
  dry_run=true
fi

branch=$(git branch --show-current)
if [[ -z "$branch" ]]; then
  echo "Error: unable to determine current branch."
  exit 1
fi

mapfile -d '' -t entries < <(git status --short --untracked-files=all --porcelain=1 -z)
if [[ ${#entries[@]} -eq 0 ]]; then
  echo "No files to commit or push."
  exit 0
fi

file_type() {
  local file="$1"
  case "$file" in
    *.cpp|*.cc|*.c|*.hpp|*.h|*.py|*.vert|*.frag|*.glsl) echo "source";;
    *.md|README*|*.txt|Makefile|*.json|*.yml|*.yaml|*.ini) echo "doc";;
    *) echo "asset";;
  esac
}

commit_file() {
  local status="$1"
  local file="$2"
  local old_path="$3"
  local message=""
  local body=""
  local type="chore"
  local action="update"

  case "$status" in
    "A "|"??")
      if [[ "$(file_type "$file")" == "source" ]]; then
        type="feat"
      else
        type="chore"
      fi
      action="add"
      message="$type: $action $file"
      body="Added file: $file"
      ;;
    " M"|"M "|"MM"|"AM")
      if [[ "$(file_type "$file")" == "source" ]]; then
        type="fix"
      else
        type="chore"
      fi
      action="update"
      message="$type: $action $file"
      body="Updated file: $file"
      ;;
    " D"|"D ")
      type="chore"
      action="remove"
      message="$type: $action $file"
      body="Removed file: $file"
      ;;
    "R ")
      type="chore"
      action="rename"
      message="$type: $action $old_path -> $file"
      body="Renamed: $old_path -> $file"
      ;;
    "C ")
      type="chore"
      action="copy"
      message="$type: $action $old_path -> $file"
      body="Copied: $old_path -> $file"
      ;;
    *)
      type="chore"
      action="update"
      message="$type: $action $file"
      body="Handled file: $file"
      ;;
  esac

  if [[ "$dry_run" == true ]]; then
    echo "Dry run: git add -A -- \"$file\""
    echo "Dry run: git commit -m \"$message\" -m \"$body\""
    return 0
  fi

  if [[ "$status" == "R " || "$status" == "C " ]]; then
    git add -A -- "$old_path" "$file"
  else
    git add -A -- "$file"
  fi
  git commit -m "$message" -m "$body"
}

index=0
while [[ $index -lt ${#entries[@]} ]]; do
  entry="${entries[$index]}"
  index=$((index + 1))
  [[ -z "$entry" ]] && continue

  status="${entry:0:2}"
  path="${entry:3}"

  if [[ "$status" == "R " || "$status" == "C " ]]; then
    if [[ $index -ge ${#entries[@]} ]]; then
      echo "Error: missing destination path for rename/copy."
      exit 1
    fi
    target="${entries[$index]}"
    index=$((index + 1))
    commit_file "$status" "$target" "$path"
  else
    commit_file "$status" "$path" ""
  fi

done

if [[ "$dry_run" == true ]]; then
  echo "Dry run terminé. Aucun commit ni push effectué."
  exit 0
fi

echo "Pushing changes to origin/$branch..."
git push origin "$branch"

echo "Terminé : modifications commités et poussés sur $branch."