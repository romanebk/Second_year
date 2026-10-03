import os
import re
import shutil

src_dir = "src"
inc_dir = "include"

# Find all .hpp files
hpp_files = []
for root, dirs, files in os.walk(src_dir):
    for f in files:
        if f.endswith(".hpp"):
            hpp_files.append(os.path.join(root, f))

# Move them to include/ preserving structure
# and keep a mapping of filename to its new include path
header_map = {}
for hpp in hpp_files:
    rel_path = os.path.relpath(hpp, src_dir)
    dest_path = os.path.join(inc_dir, rel_path)
    os.makedirs(os.path.dirname(dest_path), exist_ok=True)
    shutil.move(hpp, dest_path)
    # The canonical include path will be rel_path, e.g. "core/App.hpp"
    basename = os.path.basename(hpp)
    header_map[basename] = rel_path

# Update Makefile INCLUDES
makefile_path = "Makefile"
with open(makefile_path, "r") as f:
    makefile_content = f.read()

# Replace all INCLUDES lines with a single -I include
new_makefile_lines = []
in_includes = False
added_include = False
for line in makefile_content.split('\n'):
    if line.startswith("INCLUDES  = ") or line.startswith("INCLUDES += "):
        if not added_include:
            new_makefile_lines.append("INCLUDES  = -I include")
            added_include = True
    else:
        new_makefile_lines.append(line)

with open(makefile_path, "w") as f:
    f.write('\n'.join(new_makefile_lines))

# Update all .cpp and .hpp files with the new include paths
def update_includes(filepath):
    with open(filepath, "r") as f:
        content = f.read()
    
    # regex to match #include "..." or #include <...>
    # We only care about #include "..."
    
    def replacer(match):
        inc_str = match.group(1)
        # get the basename of the included file
        basename = os.path.basename(inc_str)
        if basename in header_map:
            return f'#include "{header_map[basename]}"'
        return match.group(0)

    new_content = re.sub(r'#include\s+"([^"]+)"', replacer, content)
    
    if new_content != content:
        with open(filepath, "w") as f:
            f.write(new_content)

for root, dirs, files in os.walk(src_dir):
    for f in files:
        if f.endswith(".cpp"):
            update_includes(os.path.join(root, f))

for root, dirs, files in os.walk(inc_dir):
    for f in files:
        if f.endswith(".hpp"):
            update_includes(os.path.join(root, f))

print("Done moving and updating includes.")
