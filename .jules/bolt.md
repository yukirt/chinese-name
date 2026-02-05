## 2025-02-12 - [Data Consistency vs Filtering]
**Learning:** In this codebase, the "Zodiac" JSON files categorize characters by stroke count (e.g., under key `_7`). However, the "ChineseCharacters" database also stores stroke counts.
**Insight:** Relying solely on the "ChineseCharacters" database for stroke count verification (via an O(1) map) exposed that some characters listed in Zodiac files might have conflicting stroke counts.
**Action:** When replacing list-based filtering with map-based lookups, ensure strict validation against the source of truth (the map) matches the original intent (filtering by specific stroke count), rather than assuming the input list is perfectly accurate.
