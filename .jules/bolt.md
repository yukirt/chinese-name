## 2024-05-23 - Console Logging Performance
**Learning:** `console.log` inside loops, even small ones (100 iterations), can be a significant performance bottleneck in browser environments (or simulated ones like Playwright). In this case, logging objects inside a loop of 139 items added ~20ms overhead.
**Action:** Always measure performance *without* heavy logging in critical paths. Use `console.time` around the block, but avoid logging per-item inside the block.

## 2024-05-23 - Hash Map vs Linear Scan
**Learning:** Replacing nested loops (O(N*M)) with Hash Map lookups (O(N)) for character property retrieval improved `zodiacLogic` execution time from ~30ms to ~9ms (3x speedup). Even for small datasets (hundreds of items), the difference is measurable and contributes to UI responsiveness.
**Action:** Whenever performing repeated lookups against a static dataset (like character properties), pre-index the data into a Hash Map on load.
