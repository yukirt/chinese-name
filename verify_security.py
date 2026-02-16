import re
import sys

def check_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Find all anchor tags with target="_blank"
    matches = re.findall(r'<a\s+[^>]*target="_blank"[^>]*>', content)

    issues = []
    for match in matches:
        if 'rel="noopener noreferrer"' not in match and 'rel="noreferrer noopener"' not in match:
            issues.append(match)

    return issues

if __name__ == "__main__":
    filepath = 'index.html'
    issues = check_file(filepath)

    if issues:
        print(f"Found {len(issues)} security issues in {filepath}:")
        for issue in issues:
            print(f"  - Missing rel=\"noopener noreferrer\" in: {issue}")
        sys.exit(1)
    else:
        print(f"No security issues found in {filepath} regarding target=\"_blank\".")
        sys.exit(0)
