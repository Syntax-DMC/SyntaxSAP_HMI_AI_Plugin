# synKiCopilot Joule UI Redesign - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Replace the synKiCopilot UI with the Joule-style purple gradient design from the aichatbot_plugin, adding Sidebar + Conversation History + New Conversation while keeping all backend logic untouched.

**Architecture:** The View (JS View) gets a complete rewrite with Joule layout. The CSS is replaced entirely with the aichatbot_plugin's purple theme, adapted for synKiCopilot class prefix. The Controller is extended with sidebar/history methods - all backend communication stays as-is. PropertyEditor drops the dialogMode switch.

**Tech Stack:** SAP UI5 (sap.m controls), JS View pattern (sap.ui.jsview), CSS3, sessionStorage

**Source reference for 1:1 copy:** `/Users/maxklumb/Library/CloudStorage/OneDrive-SYNTAXSYSTEMSLTD/Documents/Arbeit/Projekte/SAP DM/aichatbot_plugin/`

**Security note:** History list rendering uses escaped content via `_escapeHtmlAttr()` helper. Bot message HTML is sanitized via the existing `Formatter.sanitizeHtml()` pipeline (unchanged from v0.8.1b).

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `synKiCopilot/css/style.css` | **Rewrite** | Complete Joule theme (1:1 from aichatbot_plugin CSS, class prefix `synCopilot`) |
| `synKiCopilot/view/SynKiCopilot.view.js` | **Rewrite** | Joule layout: header, sidebar, welcome, chips, chat, input |
| `synKiCopilot/controller/SynKiCopilot.controller.js` | **Extend** | Add sidebar/history/new-conversation. Remove dialog mode. Keep all backend. |
| `synKiCopilot/builder/PropertyEditor.js` | **Minor edit** | Remove `dialogMode` switch |
| `synKiCopilot/i18n/i18n_de.properties` | **Extend** | Add sidebar/history/chip keys |
| `synKiCopilot/i18n/i18n_en.properties` | **Extend** | Add sidebar/history/chip keys (English) |
| `tests/TEST_CASES.md` | **Extend** | Add test cases for new features |

**Files NOT changed:** Component.js, manifest.json, config.json, util/Formatter.js, util/ResponseParser.js, util/ChartRenderer.js, model/models.js, lib/*, designer/components.json

---

## Task 1: CSS Rewrite

**Files:**
- Rewrite: `synKiCopilot/css/style.css`

This is a direct port of the aichatbot_plugin CSS with the `synCopilot` class prefix. The entire file is replaced.

- [ ] **Step 1: Read current style.css to confirm replacement scope**

The current file has Syntax blue theme, dark mode support, dialog mode styles. All replaced.

- [ ] **Step 2: Write new style.css**

Replace the entire content of `synKiCopilot/css/style.css`. This is a 1:1 port from the aichatbot_plugin's `css/style.css` with these adaptations:

1. Class prefix `aichatbot-` becomes `synCopilot` (camelCase to match existing convention)
2. Settings page styles removed (no settings page in synKiCopilot)
3. Reasoning steps dialog styles removed (not applicable)
4. Follow-up chip styles kept (useful for clickable suggestions)
5. Chart styles added from current synKiCopilot (adapted to purple `#5B4FD6`)
6. Debug timing bubble styles kept from current synKiCopilot
7. Accessibility (focus-visible, reduced-motion) added

Port these sections from aichatbot_plugin CSS (use exact values):
- Root `.synCopilotRoot` = `.aichatbot-root` (lines 5-14)
- Chat container flex fix (lines 16-30)
- Welcome section `linear-gradient(180deg, #6366F1 0%, #7C3AED 50%, #A855F7 100%)` (lines 35-39)
- Header bar `linear-gradient(135deg, #5B4FD6, #7C5FE8)` (lines 42-72)
- Sparkle icon area (lines 74-92)
- Greeting styles (lines 94-111)
- Hint card `rgba(255, 255, 240, 0.9)` bg (lines 113-127)
- Content/scroll area (lines 131-153)
- Suggestion chips `#5B4FD6` text, `#f0ecff` hover (lines 155-176)
- Chat messages - user `linear-gradient(135deg, #6366F1, #8B5CF6)`, bot `#f8f8f8` (lines 178-220)
- Input section absolute positioned, `2px solid #5B4FD6` border (lines 224-358)
- Chat active state - hide welcome (lines 364-371)
- Typing indicator pulse animation (lines 376-426)
- Markdown content styles - tables with purple gradient header (lines 432-587)
- Sidebar 280px, slideInLeft animation, overlay `rgba(0,0,0,0.3)` (lines 760-1075)

- [ ] **Step 3: Verify CSS completeness**

Ensure all `synCopilot*` classes used in view (Task 2) have corresponding CSS rules.

---

## Task 2: View Rewrite

**Files:**
- Rewrite: `synKiCopilot/view/SynKiCopilot.view.js`

Complete rewrite of the JS View. Public API methods the controller calls must stay: `addBotMessage(sText)`, `addDebugMessage(sText)`, `setTyping(bTyping)`, `updateContextDisplay(oContext)`.

- [ ] **Step 1: Plan the view structure**

New DOM structure (matches aichatbot_plugin MainView.view.xml):

```
HTML root (position: relative)
+-- div#synCopilotSidebar (hidden, absolute, z-1000)
|   +-- Sidebar Header (menu btn + title + close btn)
|   +-- New Conversation button
|   +-- div#synCopilotHistoryList (scrollable)
+-- div#synCopilotSidebarOverlay (hidden, absolute, z-999)
+-- VBox chatRoot (flex: 1)
    +-- HBox header (purple gradient)
    |   +-- Button hamburger
    |   +-- Text "Syntax Copilot v0.9.0"
    +-- VBox chatViewContainer
        +-- div#synCopilotWelcome (purple gradient, hides on first msg)
        |   +-- SVG sparkle icon (120x120, white, from aichatbot_plugin)
        |   +-- Greeting text
        |   +-- Hint card
        +-- div#synCopilotChips (hides on first msg)
        |   +-- 6 chip buttons
        +-- ScrollContainer#synCopilotChat
        |   +-- VBox#synCopilotMessages
        +-- div#synCopilotInputSection (absolute bottom)
            +-- HBox inputRow (purple pill border)
            +-- Text disclaimer
```

- [ ] **Step 2: Write the new view file**

Replace entire `synKiCopilot/view/SynKiCopilot.view.js`. Key points:
- Keep `sap.ui.jsview` pattern
- `PLUGIN_VERSION = "0.9.0"`
- SVG sparkle: exact paths from aichatbot_plugin lines 113-118
- Chips: 6 buttons using i18n chip keys, send same query texts as current tags
- `addBotMessage`: sanitized HTML via Formatter.sanitizeHtml (same pipeline as v0.8.1b)
- `setTyping`: same typewriter effect with Daft Punk phrases
- New `_showWelcome()` method: makes welcome + chips visible again (for New Conversation)
- `_hideWelcome()`: hides welcome + chips (called on first message)

- [ ] **Step 3: Verify public API compatibility**

Methods that must exist with same signatures:
- `addBotMessage(sText)` - HTML string, renders in bot bubble
- `addDebugMessage(sText)` - plain text, renders in debug bubble
- `setTyping(bTyping)` - boolean, shows/hides typing indicator
- `updateContextDisplay(oContext)` - object with plant/sfc/workCenter/resource

---

## Task 3: Controller Extension

**Files:**
- Modify: `synKiCopilot/controller/SynKiCopilot.controller.js`

Add sidebar, history, new conversation. Remove dialog mode. Keep all backend untouched.

- [ ] **Step 1: Add storage constants**

Add after existing `CONSTANTS` block:

```javascript
var STORAGE_KEYS = {
    MESSAGES: "synkicopilot_messages",
    HISTORY: "synkicopilot_history"
};
```

- [ ] **Step 2: Add sidebar methods**

Add `_openSidebar`, `_closeSidebar` methods that show/hide `#synCopilotSidebar` and `#synCopilotSidebarOverlay` via `display` style.

- [ ] **Step 3: Add history methods**

Add these methods:
- `_saveMessages()` - serialize chat model messages to `sessionStorage`
- `_restoreMessages()` - load from sessionStorage, replay into view
- `_loadHistory()` / `_saveHistory(aHistory)` - sessionStorage CRUD
- `_saveCurrentToHistory()` - snapshot current chat to history (max 20 entries)
- `onNewConversation()` - save current, clear chat, show welcome, close sidebar
- `_loadConversation(sId)` - load a history entry into current chat
- `_deleteHistoryItem(sId)` - remove from history, re-render list
- `_renderHistoryList()` - build history HTML in `#synCopilotHistoryList`. Uses `_escapeHtmlAttr()` for safe output. Attaches click handlers for load/delete.
- `_escapeHtmlAttr(s)` - escapes &, ", <, > for safe attribute insertion

- [ ] **Step 4: Modify _addMessage to persist**

Add `this._saveMessages();` at end of existing `_addMessage` method.

- [ ] **Step 5: Modify onInit to restore**

After chat model creation in onInit, add `this._restoreMessages();`

- [ ] **Step 6: Replace onAfterRendering**

Remove dialog mode block. Replace with sidebar overlay click-to-close setup.

- [ ] **Step 7: Verify backend methods untouched**

Confirm zero changes to: `_sendQuery`, `_callProductionProcess`, `_callGateway`, `_callLocalProxy`, `_handleResponse`, `_formatStructuredResponse`, `_handleMockResponse`, `_formatPPError`, `_detectEnvironment`, `_getEnvironmentConfig`, `_onWorklistSelect`, `_onPodSelectionChange`, `_updatePodContext`, `_showDebugTiming`, `_getFullLanguageCode`, `_generateUUID`.

---

## Task 4: PropertyEditor + i18n

**Files:**
- Modify: `synKiCopilot/builder/PropertyEditor.js`
- Modify: `synKiCopilot/i18n/i18n_de.properties`
- Modify: `synKiCopilot/i18n/i18n_en.properties`

- [ ] **Step 1: Remove dialogMode from PropertyEditor**

Remove the `addSwitch` call for `dialogMode` and the `dialogMode: false` from `getDefaultPropertyData`.

- [ ] **Step 2: Add German i18n keys**

Append sidebar, welcome, and chip keys to `i18n_de.properties`.

- [ ] **Step 3: Add English i18n keys**

Append same keys in English to `i18n_en.properties`.

---

## Task 5: Update Test Cases + CLAUDE.md

**Files:**
- Modify: `tests/TEST_CASES.md`
- Modify: `CLAUDE.md`

- [ ] **Step 1: Add sidebar/history/welcome/chips test cases**

New sections: Sidebar (open/close/overlay), History (save/load/delete/limit), Welcome Screen (show/hide/new conversation), Suggestion Chips (all 6 actions).

- [ ] **Step 2: Update CLAUDE.md**

Update version to 0.9.0, CSS section to purple theme, remove dialog mode references, add sidebar/history to architecture.

---

## Execution Order

1. **Task 1 (CSS)** - Independent, do first
2. **Task 2 (View)** - Depends on CSS classes
3. **Task 3 (Controller)** - Depends on View DOM IDs
4. **Task 4 (PropertyEditor + i18n)** - Can parallel with 1-3
5. **Task 5 (Tests + Docs)** - Last
