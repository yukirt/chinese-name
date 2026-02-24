# AI Agent 指引 (AGENTS.md)

此文件規範開發行為，務必嚴格遵守。

## 1. 核心原則 (Core Principles)
- **語言**：所有產出（對話、Commit、PR）皆使用 **繁體中文 (台灣)**。
- **TDD (測試驅動開發)**：嚴格執行 `Red` -> `Green` -> `Refactor`。
  1. **Red**：修改程式碼前，**必須**先撰寫會失敗的測試 (使用 Playwright 或 Python)。
  2. **Green**：撰寫最少量程式碼以通過測試。
  3. **Refactor**：在測試保護下優化程式碼。

## 2. Git 規範 (Git Standards)

### 分支命名 (Branch Naming)
格式：`<type>/<description-kebab-case>`
範例：`feat/sancai-logic`, `fix/css-overflow`

### Commit Message
遵循 **Conventional Commits**。
格式：`<type>: <標題 (50字內)>`
內文：詳細說明 (選填)

**Type 列表**：
- `feat`: 新功能
- `fix`: 修復錯誤
- `docs`: 文件
- `style`: 格式 (不影響邏輯)
- `refactor`: 重構
- `test`: 新增/修改測試
- `chore`: 建置/雜項

**範例**：
`feat: 新增五行屬性篩選`

### Pull Request (PR)
標題同 Commit Message。

**描述模板**：
```markdown
## 變更摘要
(簡述變更內容)

## TDD 驗證
- [ ] **Red**: 建立失敗測試 (附截圖/Log)
- [ ] **Green**: 實作並通過測試
- [ ] **Refactor**: 程式碼已優化

## 測試指令
(e.g., `python3 tests/verify_logic.py`)
```
