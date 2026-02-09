# Bolt's Journal

## 2026-02-09 - Handling Duplicates in Static Data Maps
**Learning:** When optimizing static data lookups by converting arrays to hash maps, always check for duplicates in the source data. In this case, `ChineseCharacters.json` contained duplicate characters (e.g., '兒' with different element properties) that were implicitly handled by linear iteration but would have been overwritten in a naive map implementation.
**Action:** Always verify data uniqueness before refactoring to a map. If duplicates exist, store values as arrays and ensure downstream consumers can handle list-based lookups.
