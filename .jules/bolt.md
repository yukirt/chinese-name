## 2026-02-22 - [Duplicate Entries in ChineseCharacters.json]
**Learning:** The `ChineseCharacters.json` file contains duplicate characters across different entries (often with different stroke counts or elements). The application logic (`getCombinations`) relies on finding the *first* occurrence in the file.
**Action:** When optimizing lookup (e.g., converting to a map), ensure the order is preserved or explicitly handle duplicates to match the original linear search behavior.
