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
    
    # Also replace any remaining sequences of ? and non-ascii dividers
    # Specifically targeting the ones seen in the logs
    new_content = re.sub(r'// \?\? JSON state .*', '// JSON state', new_content)
    new_content = re.sub(r'// \?\? Thumbnail state .*', '// Thumbnail state', new_content)
    new_content = re.sub(r'// \?\? Form submission state .*', '// Form submission state', new_content)
    new_content = re.sub(r'// \?\? Handlers .*', '// Handlers', new_content)
    new_content = re.sub(r'\{/\* \?\?\? Section 1: Basic Info .* \*/\}', '{/* Section 1: Basic Info */}', new_content)
    new_content = re.sub(r'\{/\* \?\?\? Section 2: Thumbnail .* \*/\}', '{/* Section 2: Thumbnail */}', new_content)
    new_content = re.sub(r'\{/\* \?\?\? Section 3: Data Schema .* \*/\}', '{/* Section 3: Data Schema */}', new_content)
    new_content = re.sub(r'\{/\* \?\?\? Submit error .* \*/\}', '{/* Submit error */}', new_content)
    new_content = re.sub(r'\{/\* \?\?\? Actions .* \*/\}', '{/* Actions */}', new_content)

    if content != new_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Fixed: {file_path}")
    else:
        print(f"No changes for: {file_path}")

# Replacements for TemplateEditorPanel.tsx
panel_replacements = [
    ("/** ?집??template. undefined??로 만들?모드 */", "/** Template to edit. If undefined, it is in create mode. */"),
    ("// 로컬 미리보기", "// Local preview"),
    ("setThumbnailPreview(thumbnailUrl); // 롤백", "setThumbnailPreview(thumbnailUrl); // Rollback"),
    ("// Deploy Template 버튼? status?'active'?강제", "// Force status to 'active' for Deploy Template button"),
    ("Edit ??", "Edit "),
    ("{/* Status (Draft/Active/Archived) ??기본 select */}", "{/* Status (Draft/Active/Archived) default select */}"),
    ("Uploading??", "Uploading..."),
    ("{/* Save Draft ??status??select?서 가?옴 */}", "{/* Save Draft - status is taken from select */}"),
    ("Saving??", "Saving..."),
    ("{/* Deploy Template ??status?'active'?강제 */}", "{/* Deploy Template - force status to 'active' */}"),
    ("Deploying??", "Deploying..."),
]

# Replacements for actions.ts
actions_replacements = [
    ("// redirect throws a special Next.js error ??rethrow it", "// redirect throws a special Next.js error, rethrow it"),
]

# Replacements for TemplateListPanel.tsx
list_replacements = [
    ("No templates yet. Create one ??", "No templates yet. Create one..."),
]

# Replacements for create-site-from-template.usecase.ts
usecase_replacements = [
    ("/** Admin??커스? ?이?? 직접 ?성 (template ?이) */", "/** Admin direct creation of custom site (without template) */"),
    ("/**\n   * Admin??커스? ?이?? 직접 ?성 (template ?이)\n   */", "/**\n   * Admin direct creation of custom site (without template)\n   */"),
]

# Replacements for login/page.tsx
login_replacements = [
    ("console.log('로그인 성공', result.user);", "console.log('Login success', result.user);"),
]

# Replacements for ConditionalLayoutWrapper.tsx
layout_replacements = [
    ("// 메인 Navbar를 숨겨야 하는 경로들 (대시보드, 관리자, 사이트 미리보기 등)", "// Paths where the main Navbar should be hidden (dashboard, admin, site preview, etc.)"),
    ("// 에디터 경로가 독립적인 경우 대비", "// In case the editor path is independent"),
]

# Replacements for DashboardClient.tsx
dashboard_replacements = [
    (">사이트 요약 (SYSTEM_METRICS)<", ">Site Summary (SYSTEM_METRICS)<"),
    (">최근 작업 (NODE_HIGHLIGHT)<", ">Recent Activity (NODE_HIGHLIGHT)<"),
    (">빠른 액션 (QUICK_EXECUTION)<", ">Quick Actions (QUICK_EXECUTION)<"),
    (">사이트 리스트 (SITE_REGISTRY_SUMMARY)<", ">Site List (SITE_REGISTRY_SUMMARY)<"),
]

# Replacements for slots.ts
slots_replacements = [
    ("// 기존 슬롯 정의 유지", "// Maintain existing slot definitions"),
    ("// 새롭게 추가: 해당 테마(Corporate)를 위한 초기 JSON 형태 저장", "// Newly added: Store initial JSON format for the Corporate theme"),
]

fix_file(r'src/app/admin/templates/TemplateEditorPanel.tsx', panel_replacements)
fix_file(r'src/app/dashboard/templates/actions.ts', actions_replacements)
fix_file(r'src/app/admin/templates/TemplateListPanel.tsx', list_replacements)
fix_file(r'src/domain/usecases/user-site/create-site-from-template.usecase.ts', usecase_replacements)
fix_file(r'src/app/login/page.tsx', login_replacements)
fix_file(r'src/components/ConditionalLayoutWrapper.tsx', layout_replacements)
fix_file(r'src/app/dashboard/DashboardClient.tsx', dashboard_replacements)
fix_file(r'src/themes/corporate/slots.ts', slots_replacements)
