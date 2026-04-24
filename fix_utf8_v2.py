import re
import os

def fix_file(file_path, replacements):
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return
    
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    new_content = content
    for old, new in replacements:
        new_content = new_content.replace(old, new)
    
    # regex for TemplateEditorPanel headers
    new_content = re.sub(r'// .* JSON state .*', '// JSON state', new_content)
    new_content = re.sub(r'// .* Thumbnail state .*', '// Thumbnail state', new_content)
    new_content = re.sub(r'// .* Form submission state .*', '// Form submission state', new_content)
    new_content = re.sub(r'// .* Handlers .*', '// Handlers', new_content)
    
    # regex for Section headers in TemplateEditorPanel
    new_content = re.sub(r'\{/\* .* Section 1: Basic Info .* \*/\}', '{/* Section 1: Basic Info */}', new_content)
    new_content = re.sub(r'\{/\* .* Section 2: Thumbnail .* \*/\}', '{/* Section 2: Thumbnail */}', new_content)
    new_content = re.sub(r'\{/\* .* Section 3: Data Schema .* \*/\}', '{/* Section 3: Data Schema */}', new_content)
    new_content = re.sub(r'\{/\* .* Submit error .* \*/\}', '{/* Submit error */}', new_content)
    new_content = re.sub(r'\{/\* .* Actions .* \*/\}', '{/* Actions */}', new_content)

    # Specific fix for create-site-from-template.usecase.ts
    new_content = re.sub(r'\* Admin.* 직접 .* \(template .*\)', '* Admin direct creation of custom site (without template)', new_content)

    if content != new_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Fixed: {file_path}")
    else:
        print(f"No changes for: {file_path}")

# Panel replacements (refreshing them just in case)
panel_replacements = [
    ("Uploading??", "Uploading..."),
    ("Saving??", "Saving..."),
    ("Deploying??", "Deploying..."),
    ("Edit ??", "Edit "),
]

# Run again for the usecase file
fix_file(r'src/domain/usecases/user-site/create-site-from-template.usecase.ts', [])
fix_file(r'src/app/admin/templates/TemplateEditorPanel.tsx', panel_replacements)
