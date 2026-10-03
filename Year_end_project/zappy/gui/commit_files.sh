#!/bin/bash

# Commit Makefile
if git status --porcelain | grep -q "Makefile"; then
    git add Makefile
    git commit -m "refactor: Update Makefile for new include directory"
fi

# Commit modified cpp files in src/
for file in $(git diff --name-only --diff-filter=M src/); do
    git add "$file"
    git commit -m "refactor: Update include paths in $(basename "$file")"
done

# Commit moved hpp files
for file in $(find include -type f -name "*.hpp"); do
    rel_path="${file#include/}"
    old_file="src/$rel_path"
    
    git add "$file"
    # Stage the deletion of the old file so git sees it as a rename
    git add "$old_file" 2>/dev/null
    
    git commit -m "refactor: Move $(basename "$file") to include directory"
done

# Commit untracked cpp files that were modified by the script
for file in src/renderer/PlayerMovement.cpp src/renderer/PlayerSelector.cpp; do
    if [ -f "$file" ]; then
        git add "$file"
        git commit -m "feat/refactor: Add and update $(basename "$file")"
    fi
done

