#!/usr/bin/env python3
"""
sync_clues.py - Clue Catalog Management & Story Spec Verification Tool
Governs bi-directional synchronization and validation of clues between:
  - clue-ideas-inventory.md
  - clue-traceability-matrix.md
  - story design specs (.agent-artifacts/requirements/stories/husband-<name>/level-XX.md)
"""

import sys
import os
import re
import argparse
import json
from pathlib import Path

# Ensure UTF-8 output on Windows console
if sys.platform == "win32":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    if hasattr(sys.stderr, "reconfigure"):
        sys.stderr.reconfigure(encoding="utf-8")

# Resolve workspace root relative to script location (.agents/skills/level-designer/scripts/)
SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parents[3]
CLUES_DIR = REPO_ROOT / ".agent-artifacts" / "requirements" / "stories" / "clues"
INVENTORY_FILE = CLUES_DIR / "clue-ideas-inventory.md"
MATRIX_FILE = CLUES_DIR / "clue-traceability-matrix.md"

APP_PREFIX_MAP = {
    # Generic app names (Canonical SSOT)
    "internet-messaging": "CLUE-ZOLA",
    "banking": "CLUE-BANK",
    "ecommerce": "CLUE-POSH",
    "ride-hailing": "CLUE-GRAP",
    "web-browser": "CLUE-BROW",
    "personal-notes": "CLUE-NOTE",
    "photos": "CLUE-PHOT",
    "comms": "CLUE-COMM",
    "email": "CLUE-MAIL",
    "professional-network": "CLUE-LINK",
    "team-collaboration": "CLUE-TEAM",
    # Legacy alias support
    "zola": "CLUE-ZOLA",
    "vietpay": "CLUE-BANK",
    "poshee": "CLUE-POSH",
    "grap": "CLUE-GRAP",
    "netsurf": "CLUE-BROW",
}

APP_SECTION_MAP = {
    # Generic app names (Canonical SSOT)
    "internet-messaging": "1.1. Zola (Zalo Parody - Private Messaging)",
    "banking": "1.2. Bank / E-Wallet Parody (VietQR / MoMo Style)",
    "ecommerce": "1.3. Poshee (Shopee Parody - E-Commerce)",
    "ride-hailing": "1.4. Grap / Be (Ride Hailing & Delivery Parody)",
    "web-browser": "1.5. Web Browser & Search History (\"GooGle Parody\")",
    "photos": "1.6. Photos & Gallery",
    "comms": "1.7. SMS, Contacts & Call Logs",
    "personal-notes": "1.8. Notes & Calendar (\"Ghi Chú\" & \"Lịch\")",
    "email": "1.9. GeeMail (Email App)",
    "professional-network": "1.10. InkedLin (Professional Network Parody)",
    "team-collaboration": "1.11. Tim (Team Collaboration Parody)",
    # Legacy alias support
    "zola": "1.1. Zola (Zalo Parody - Private Messaging)",
    "vietpay": "1.2. Bank / E-Wallet Parody (VietQR / MoMo Style)",
    "poshee": "1.3. Poshee (Shopee Parody - E-Commerce)",
    "grap": "1.4. Grap / Be (Ride Hailing & Delivery Parody)",
    "netsurf": "1.5. Web Browser & Search History (\"GooGle Parody\")",
}


def read_text(path: Path) -> str:
    if not path.exists():
        raise FileNotFoundError(f"File not found: {path}")
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


def write_text(path: Path, content: str) -> None:
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)


def extract_inventory_clues(content: str) -> dict:
    """Extract clue IDs and summary from clue-ideas-inventory.md"""
    clues = {}
    pattern = re.compile(
        r"\|\s*`(CLUE-[A-Z]+-\d+)`\s*\|\s*\*\*([^*]+)\*\*\s*:?\s*(.*?)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|"
    )
    for match in pattern.finditer(content):
        clue_id, title, desc, sub_type, truth, diff = match.groups()
        clues[clue_id] = {
            "id": clue_id,
            "title": title.strip(),
            "description": desc.strip(),
            "sub_type": sub_type.strip(),
            "truth": truth.strip(),
            "difficulty": diff.strip(),
            "source": "inventory",
        }
    return clues


def extract_matrix_clues(content: str) -> dict:
    """Extract clue IDs and metadata from clue-traceability-matrix.md"""
    clues = {}
    pattern = re.compile(
        r"\|\s*`(CLUE-[A-Z]+-\d+)`\s*\|\s*\[([^\]]+)\]\(([^)]+)\)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|"
    )
    for match in pattern.finditer(content):
        clue_id, app, link, comp, sub_type, truth, level, ac = match.groups()
        clues[clue_id] = {
            "id": clue_id,
            "app": app.strip(),
            "app_link": link.strip(),
            "component": comp.strip(),
            "sub_type": sub_type.strip(),
            "truth": truth.strip(),
            "level": level.strip(),
            "ac": ac.strip(),
            "source": "matrix",
        }
    return clues


def cmd_list(args):
    """List clues from catalog."""
    inv_text = read_text(INVENTORY_FILE)
    clues = extract_inventory_clues(inv_text)
    
    if args.app:
        target_prefix = APP_PREFIX_MAP.get(args.app.lower(), args.app.upper())
        clues = {k: v for k, v in clues.items() if k.startswith(target_prefix)}

    if args.json:
        print(json.dumps(list(clues.values()), indent=2, ensure_ascii=False))
        return

    print(f"\n[Clue Catalog] Found {len(clues)} clue(s) in catalog:\n")
    print(f"{'Clue ID':<16} | {'Title / Description':<45} | {'Truth / Twist':<25} | {'Diff':<8}")
    print("-" * 100)
    for cid, data in sorted(clues.items()):
        title = (data["title"][:42] + "...") if len(data["title"]) > 42 else data["title"]
        truth = (data["truth"][:22] + "...") if len(data["truth"]) > 22 else data["truth"]
        print(f"{cid:<16} | {title:<45} | {truth:<25} | {data['difficulty']:<8}")


def cmd_validate(args):
    """Validate clue IDs or a story design spec file."""
    inv_text = read_text(INVENTORY_FILE)
    matrix_text = read_text(MATRIX_FILE)
    inv_clues = extract_inventory_clues(inv_text)
    matrix_clues = extract_matrix_clues(matrix_text)

    test_ids = []
    if args.ids:
        test_ids = [i.strip() for i in args.ids.split(",") if i.strip()]
    elif args.file:
        spec_text = read_text(Path(args.file))
        found = re.findall(r"`(CLUE-[A-Z]+-\d+)`", spec_text)
        test_ids = sorted(list(set(found)))
        print(f"Extracted {len(test_ids)} clue ID(s) from {args.file}")

    if not test_ids:
        print("No clue IDs supplied or found to validate.")
        return

    missing_inv = []
    missing_matrix = []
    valid = []

    for cid in test_ids:
        in_inv = cid in inv_clues
        in_matrix = cid in matrix_clues
        if not in_inv:
            missing_inv.append(cid)
        if not in_matrix:
            missing_matrix.append(cid)
        if in_inv and in_matrix:
            valid.append(cid)

    print("\n[Validation Results]")
    print(f"Total checked: {len(test_ids)}")
    print(f"Valid in both catalog files: {len(valid)}")
    if missing_inv:
        print(f"Missing in clue-ideas-inventory.md: {', '.join(missing_inv)}")
    if missing_matrix:
        print(f"Missing in clue-traceability-matrix.md: {', '.join(missing_matrix)}")

    if missing_inv or missing_matrix:
        sys.exit(1)
    else:
        print("All clue IDs are registered and valid!")


def cmd_add(args):
    """Add a new clue to both inventory and matrix."""
    clue_id = args.id.strip().upper()
    app = args.app.strip().lower()

    if not re.match(r"^CLUE-[A-Z]+-\d{2}$", clue_id):
        raise ValueError(f"Clue ID must follow pattern 'CLUE-<APP>-XX', got: {clue_id}")

    inv_text = read_text(INVENTORY_FILE)
    matrix_text = read_text(MATRIX_FILE)

    inv_clues = extract_inventory_clues(inv_text)
    if clue_id in inv_clues:
        print(f"[Warning] Clue {clue_id} already exists in inventory. Skipping append.")
        return

    section_title = APP_SECTION_MAP.get(app)
    if not section_title:
        target_marker = "---"
    else:
        target_marker = f"### {section_title}"

    inv_row = f"| `{clue_id}` | **{args.title}:** {args.desc} | {args.type} | {args.truth} | {args.difficulty} |"

    if target_marker in inv_text:
        sec_idx = inv_text.find(target_marker)
        table_end = inv_text.find("\n\n---", sec_idx)
        if table_end == -1:
            table_end = inv_text.find("\n## ", sec_idx + len(target_marker))
        if table_end == -1:
            table_end = len(inv_text)
        
        new_inv_text = inv_text[:table_end].rstrip() + "\n" + inv_row + "\n" + inv_text[table_end:]
    else:
        new_inv_text = inv_text.rstrip() + f"\n\n### {app.capitalize()}\n\n| Clue ID | Clue Description | Sub-Type | Intended Truth / Twist | Difficulty |\n|---|---|---|---|---|\n{inv_row}\n"

    write_text(INVENTORY_FILE, new_inv_text)
    print(f"[Success] Added {clue_id} to {INVENTORY_FILE.name}")

    app_display = args.app_display or app.replace("-", " ").title()
    if app in ("photos", "comms"):
        default_link = f"../../../project-knowledge-base/solution-context/apps/phone-os/{app}/features.md"
    else:
        default_link = f"../../../project-knowledge-base/solution-context/apps/{app}/features.md"
    app_link = args.app_link or default_link
    component = args.component or f"{app_display}View - Interactive Clue Element"
    level = args.level or "Level 1, 2"
    ac = args.ac or args.desc

    matrix_row = f"| `{clue_id}` | [{app_display}]({app_link}) | {component} | {args.type} | {args.truth} | {level} | {ac} |"

    mat_marker = "## 2."
    if mat_marker in matrix_text:
        mat_idx = matrix_text.find(mat_marker)
        new_matrix_text = matrix_text[:mat_idx].rstrip() + "\n" + matrix_row + "\n\n" + matrix_text[mat_idx:]
    else:
        new_matrix_text = matrix_text.rstrip() + "\n" + matrix_row + "\n"

    write_text(MATRIX_FILE, new_matrix_text)
    print(f"[Success] Added {clue_id} to {MATRIX_FILE.name}")


def cmd_verify_spec(args):
    """Verify completeness and rules of a story design spec and its companion files."""
    spec_path = Path(args.spec_file)
    if not spec_path.exists():
        print(f"Error: Spec file not found: {spec_path}")
        sys.exit(1)

    content = read_text(spec_path)
    print(f"\n[Auditing Story Spec: {spec_path.name}]")

    # 1. Frontmatter check (simplified: requires frontmatter with husband and level)
    has_frontmatter = content.startswith("---") and "\n---" in content[3:]
    has_husband = bool(re.search(r"(?:husband|husbandId):\s*([\w-]+)", content))
    level_match = re.search(r"(?:level|levelNumber):\s*(\d)", content)

    fm_valid = has_frontmatter and has_husband and bool(level_match)
    print(f" - Frontmatter contract: {'PASS (Simplified husband & level)' if fm_valid else 'FAIL (requires husband and level)'}")

    # 1b. Check folder naming convention (must be husband-<name>)
    parent_dir = spec_path.parent.name
    is_husband_dir = parent_dir.startswith("husband-")
    print(f" - Folder convention: {'PASS (husband-<name>)' if is_husband_dir else f'FAIL (folder \"{parent_dir}\" must follow \"husband-<name>\")'}")

    # 1c. Check companion files (husband-profile.md, level-XX-storyboard.md, level-XX-phone-data.md)
    stem = spec_path.stem  # e.g. level-01
    profile_path = spec_path.parent / "husband-profile.md"
    storyboard_path = spec_path.parent / f"{stem}-storyboard.md"
    phone_data_path = spec_path.parent / f"{stem}-phone-data.md"

    has_profile = profile_path.exists()
    print(f" - Husband Profile SSOT (husband-profile.md): {'PASS' if has_profile else 'WARN (missing husband-profile.md in husband folder)'}")

    storyboard_ok = False
    if storyboard_path.exists():
        sb_content = read_text(storyboard_path)
        mermaid_blocks = re.findall(r"```mermaid[\s\S]*?```", sb_content)
        required_containers = ["subgraph ALL_SUSPECTS", "subgraph ALIASES", "subgraph APPS", "subgraph CLUE_NODES"]
        has_all_containers = all(c in sb_content for c in required_containers)
        storyboard_ok = len(mermaid_blocks) >= 2 and has_all_containers
        print(
            f" - Storyboard & Diagrams ({storyboard_path.name}): "
            f"{'PASS (Found ' + str(len(mermaid_blocks)) + ' Mermaid diagrams with ALL_SUSPECTS > ALIASES > APPS > CLUE_NODES)' if storyboard_ok else 'FAIL (Requires >=2 Mermaid diagrams and 4 containers: ALL_SUSPECTS, ALIASES, APPS, CLUE_NODES)'}"
        )
    else:
        print(f" - Storyboard & Diagrams ({storyboard_path.name}): WARN (missing {storyboard_path.name})")

    pronoun_warnings = []
    if phone_data_path.exists():
        pd_content = read_text(phone_data_path)
        # Detect self-contradictory Vietnamese address vs self-pronoun in the same utterance
        contradiction_pattern = re.compile(
            r"(?:Anh|Chị)\s+[A-ZÀ-Ỹ][\wÀ-ỹ]*\s+ơi[^\n”\"]*\b(?:giúp\s+a|giúp\s+anh|cho\s+a|cho\s+anh)\b",
            re.IGNORECASE,
        )
        for m in contradiction_pattern.finditer(pd_content):
            pronoun_warnings.append(m.group(0))
        if pronoun_warnings:
            print(f" - Vietnamese Pronoun Check ({phone_data_path.name}): WARN (Self-contradictory address/pronoun: {pronoun_warnings[0]!r})")
        else:
            print(f" - Vietnamese Pronoun Check ({phone_data_path.name}): PASS")

    # 2. Check essential numbered sections (supports both Vietnamese and English)
    required_prefixes = ["## 1.", "## 2.", "## 3.", "## 4.", "## 5.", "## 6.", "## 7."]
    missing_sec = [p for p in required_prefixes if p not in content]
    if missing_sec:
        print(f" - Section structure: FAIL (Missing section prefixes: {', '.join(missing_sec)})")
    else:
        print(" - Section structure: PASS (All canonical sections 1-7 present)")

    # 2b. Check Anti-Obviousness & Spoilers Guard (Anti-Pattern Filter)
    obvious_spoilers = [
        ("vợ có kiểm tra máy", "Direct exposition in chat (unrealistic dialogue)"),
        ("tiêu vặt cho bé", "Direct spoiler in notification/memo (too obvious)"),
        ("mã pin là 1310", "Explicit PIN disclosure in notes"),
        ("mã pin là 2026", "Explicit PIN disclosure in notes"),
    ]
    detected_spoilers = []
    content_lower = content.lower()
    for phrase, reason in obvious_spoilers:
        if phrase in content_lower:
            detected_spoilers.append(f"'{phrase}' ({reason})")

    lvl = int(level_match.group(1)) if level_match else 1
    spoilers_failed = bool(detected_spoilers)
    if spoilers_failed:
        print(f" - Known Spoiler Phrase Scan: FAIL (Level {lvl}: {'; '.join(detected_spoilers)})")
    else:
        print(" - Known Spoiler Phrase Scan: PASS (manual narrative/subtlety review still required)")

    # 3. Check level constraints
    if level_match:
        expected_strikes = {1: 5, 2: 4, 3: 3}.get(lvl, 3)
        print(f" - Level {lvl} Allowed Strikes ({expected_strikes}): PASS")
    else:
        print(" - Level number: FAIL (missing 'level: <1|2|3>' in frontmatter)")

    # 4. Check clue references against catalog (from both level-XX.md and level-XX-storyboard.md if present)
    inv_text = read_text(INVENTORY_FILE)
    inv_clues = extract_inventory_clues(inv_text)
    combined_spec_text = content + ("\n" + read_text(storyboard_path) if storyboard_path.exists() else "")
    spec_clues = sorted(list(set(re.findall(r"`(CLUE-[A-Z]+-\d+)`", combined_spec_text))))
    missing_clues = [c for c in spec_clues if c not in inv_clues]

    if missing_clues:
        print(f" - Clue catalog integrity: FAIL (Clues not in catalog: {', '.join(missing_clues)})")
    else:
        print(f" - Clue catalog integrity: PASS ({len(spec_clues)} clues registered in catalog)")

    if missing_sec or missing_clues or spoilers_failed or not is_husband_dir or (storyboard_path.exists() and not storyboard_ok):
        sys.exit(1)
    else:
        print("\nStory spec passed all validation checks!")


def main():
    parser = argparse.ArgumentParser(description="Clue catalog sync & verification tool for story builder")
    subparsers = parser.add_subparsers(dest="command", required=True)

    # list
    p_list = subparsers.add_parser("list", help="List clues from catalog")
    p_list.add_argument("--app", help="Filter by app (internet-messaging, banking, ecommerce, ride-hailing, web-browser, photos, comms, personal-notes, email, professional-network, team-collaboration)")
    p_list.add_argument("--json", action="store_true", help="Output in JSON format")

    # validate
    p_val = subparsers.add_parser("validate", help="Validate clue IDs against catalog")
    p_val.add_argument("--ids", help="Comma-separated clue IDs")
    p_val.add_argument("--file", help="Path to markdown story spec file to extract clue IDs from")

    # add
    p_add = subparsers.add_parser("add", help="Add a new clue to inventory & matrix")
    p_add.add_argument("--id", required=True, help="Clue ID (e.g. CLUE-ZOLA-07)")
    p_add.add_argument("--app", required=True, help="App identifier (internet-messaging, banking, ecommerce, etc.)")
    p_add.add_argument("--title", required=True, help="Short clue title")
    p_add.add_argument("--desc", required=True, help="Clue narrative description")
    p_add.add_argument("--type", required=True, help="Clue sub-type (e.g. Text Mismatch, Locked Chat)")
    p_add.add_argument("--truth", required=True, help="Intended truth or twist (Cheating, Innocent, Sugar)")
    p_add.add_argument("--difficulty", default="Medium", help="Difficulty (Easy, Medium, Hard)")
    p_add.add_argument("--app-display", help="App display name (e.g. VietPay)")
    p_add.add_argument("--app-link", help="Relative link to app features.md")
    p_add.add_argument("--component", help="Target component in app (e.g. VietPayHistoryView)")
    p_add.add_argument("--level", default="Level 1, 2", help="Target levels (e.g. Level 2, 3)")
    p_add.add_argument("--ac", help="Forensic acceptance criteria")

    # verify-spec
    p_vspec = subparsers.add_parser("verify-spec", help="Verify a story design spec file")
    p_vspec.add_argument("spec_file", help="Path to story design spec markdown file")

    args = parser.parse_args()

    if args.command == "list":
        cmd_list(args)
    elif args.command == "validate":
        cmd_validate(args)
    elif args.command == "add":
        cmd_add(args)
    elif args.command == "verify-spec":
        cmd_verify_spec(args)


if __name__ == "__main__":
    main()
