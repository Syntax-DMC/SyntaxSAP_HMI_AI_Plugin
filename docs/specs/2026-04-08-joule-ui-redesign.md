# synKiCopilot Joule UI Redesign

**Date:** 2026-04-08
**Version:** 0.9.0 (next release after 0.8.1b)
**Source reference:** `aichatbot_plugin` at `/Users/maxklumb/.../SAP DM/aichatbot_plugin`

## Goal

Replace the current Syntax-branded blue UI with the Joule-style purple gradient design from the aichatbot_plugin. Add Sidebar with Conversation History and New Conversation. Keep all backend logic, util modules, and POD integration untouched.

---

## 1. Visual Design

### 1.1 Color Scheme

| Token | Value | Usage |
|---|---|---|
| Primary | `#5B4FD6` | Buttons, input border, accents |
| Primary Hover | `#4A3FC5` | Button hover states |
| Header Gradient | `linear-gradient(135deg, #5B4FD6, #7C5FE8)` | Header bar |
| Welcome Gradient | `linear-gradient(180deg, #6366F1 0%, #7C3AED 50%, #A855F7 100%)` | Welcome section background |
| User Bubble | `linear-gradient(135deg, #6366F1, #8B5CF6)` | User message bubbles |
| Bot Bubble BG | `#f8f8f8` | Bot message background |
| Bot Bubble Border | `#eeeeee` | Bot message border |
| Sidebar BG | `#ffffff` | Sidebar background |
| Chip Border | `1.5px solid #e0e0e0` | Suggestion chips |
| Chip Text | `#5B4FD6` | Chip label color |
| Chip Hover BG | `#f0ecff` | Chip hover state |
| Disclaimer | `#999999` | Footer text |

### 1.2 Layout Structure

```
HBox (root)
+-- VBox (sidebar, 280px, hidden by default)
|   +-- Header: Hamburger + "Syntax Copilot"
|   +-- Button: "New Conversation"
|   +-- ScrollArea: History list
|   +-- Footer: (empty, reserved)
+-- div (sidebarOverlay, semi-transparent, hidden)
+-- VBox (chatRoot, flex:1)
    +-- HBox (header bar, purple gradient)
    |   +-- Button: Hamburger menu (left)
    |   +-- Text: "Syntax Copilot" (center/left)
    |   +-- (right side: reserved for future icons)
    +-- VBox (chatViewContainer, flex:1)
        +-- VBox (welcomeSection, purple gradient, hides after first message)
        |   +-- SVG: Joule sparkle icon (120x120, white)
        |   +-- Text: Greeting ("Hello, How can I assist you?")
        |   +-- Card: "Talk to me naturally."
        +-- ScrollContainer (chatArea, flex:1)
        |   +-- VBox (suggestionChips, visible until first message)
        |   |   +-- Chip: "NC-Meldungen erkl\u00e4ren"
        |   |   +-- Chip: "Letzte Schicht"
        |   |   +-- Chip: "Stillst\u00e4nde"
        |   |   +-- Chip: "Top 5 Gr\u00fcnde"
        |   |   +-- Chip: "Qualit\u00e4t"
        |   |   +-- Chip: "Auftragsstatus"
        |   +-- VBox (chatMessages, dynamic)
        +-- VBox (inputSection, absolute bottom)
            +-- HBox (inputRow): Input + Send button
            +-- Text: Disclaimer
```

### 1.3 Welcome Screen

- Full-height purple gradient background (same as screenshot)
- White Joule sparkle/diamond SVG icon centered (120x120px), taken from aichatbot_plugin
- Greeting text: i18n key `synKiCopilot.welcome.greeting` - "Hello," (light) + "How can I assist you?" (large, bold)
- Hint card: White/translucent rounded card with "Talk to me naturally."
- Entire welcome section hides when first message is sent

### 1.4 Chat Bubbles

- **User**: Purple gradient background, white text, rounded with `border-bottom-right-radius: 6px`
- **Bot**: Light gray (`#f8f8f8`) background, `#eeeeee` border, `border-bottom-left-radius: 6px`
- Bot content (Markdown HTML) styled with purple accents for headings/bold (using primary `#5B4FD6`)
- Timestamps below each bubble (small, gray)

### 1.5 Input Area

- Positioned at bottom of chat container
- Pill-shaped input: `border-radius: 28px`, `border: 2px solid #5B4FD6`
- Send button: Circular, purple fill, white paper-plane icon
- Placeholder: i18n `synKiCopilot.inputPlaceholder`

### 1.6 Suggestion Chips

Replace the current tag bar. Same functionality (send predefined queries), new visual:
- Horizontal wrapping layout below welcome section
- Each chip: Rounded border, purple text, hover with light purple background
- Same 6 actions as current tags (NC, Schicht, Ausfall, Top 5, Qualit\u00e4t, Auftrag)
- Hide after first message (same as welcome)

---

## 2. New Features

### 2.1 Sidebar

- **Width**: 280px, slides in from left with CSS animation (0.25s ease)
- **Trigger**: Hamburger menu button in header
- **Overlay**: Semi-transparent dark overlay behind sidebar, click to close
- **Content**:
  - Header row: Menu close button + "Syntax Copilot" title
  - "New Conversation" button: Purple outline style
  - History list: Scrollable, each item shows title + timestamp + delete button
  - No settings section (agent is fixed via POD Designer)

### 2.2 Conversation History

- **Storage**: `sessionStorage` (same as aichatbot_plugin - data is per-tab, cleared on tab close)
- **Keys**:
  - `synkicopilot_messages` - Current conversation messages
  - `synkicopilot_history` - Array of saved conversations
- **Entry format**:
  ```json
  {
    "id": "conv_<timestamp>",
    "title": "<first user message, max 50 chars>",
    "timestamp": "<ISO string>",
    "messages": [{ "text": "...", "type": "user|bot" }]
  }
  ```
- **Behavior**:
  - "New Conversation": Saves current conversation to history (if it has messages), clears chat, shows welcome screen again
  - Click history item: Loads that conversation, hides welcome
  - Delete history item: Removes from list with confirmation
  - On page load: Restore current messages from sessionStorage (existing pattern from aichatbot_plugin)

### 2.3 Dialog Mode Removal

The current `dialogMode` (launcher button + sap.m.Dialog) is removed. The Joule UI is always the full sidepanel experience. The `dialogMode` POD Designer property is removed from PropertyEditor.

---

## 3. Files Changed

### 3.1 `synKiCopilot/css/style.css` - Complete Rewrite

Replace entire file with Joule-style CSS. Key sections:
- Root variables (purple palette)
- Header (gradient bar)
- Sidebar (slide-in, overlay)
- Welcome section (gradient background, sparkle icon)
- Chat area (flex layout)
- Message bubbles (user=purple, bot=gray)
- Input area (pill shape, purple border)
- Suggestion chips
- Bot content (Markdown: tables with purple header, charts, code blocks)
- Typing indicator (spinner, typewriter text)
- Debug timing bubble
- Accessibility (focus-visible, reduced-motion)
- No dark mode (can be added later)

### 3.2 `synKiCopilot/view/SynKiCopilot.view.js` - Major Rewrite

- Remove: Dialog mode code (`setDialogMode`, `_createDialogLauncher`, `_openCopilotDialog`, `_createDialogContent`, `_initializeDialogUI`, `_handleDialogSend`, `_addDialogMessage`, `_scrollDialogToBottom`, `_startDialogTypewriter`, `_stopDialogTypewriter`)
- Remove: Current header HTML (replaced by gradient header bar)
- Remove: Tags bar (replaced by chips)
- Add: Sidebar panel HTML + initialization
- Add: Welcome section with SVG sparkle icon
- Add: Suggestion chips
- Add: Joule-style header with hamburger menu
- Keep: Chat message rendering logic (`_addMessage`, `addBotMessage`, `addDebugMessage`)
- Keep: Typing indicator logic
- Keep: Typewriter effect (Daft Punk phrases)
- Adapt: `_scrollToBottom` (target new container ID)
- Adapt: `updateContextDisplay` (move to new header location or remove if header no longer shows context - context is still available via the model)

### 3.3 `synKiCopilot/controller/SynKiCopilot.controller.js` - Extend

- Add: `_initSidebar()` - Sidebar open/close logic
- Add: `_openSidebar()` / `_closeSidebar()` - Toggle with animation
- Add: `_saveCurrentToHistory()` - Save current conversation to sessionStorage
- Add: `_loadHistory()` / `_renderHistoryList()` - Load and display history
- Add: `_deleteHistoryItem(sId)` - Remove single history entry
- Add: `onNewConversation()` - Save current, clear chat, show welcome
- Add: `_saveMessages()` / `_restoreMessages()` - sessionStorage persistence for current chat
- Add: Storage key constants (`STORAGE_KEY`, `HISTORY_KEY`)
- Remove: Dialog-mode related code in `onAfterRendering`
- Keep: ALL backend communication (`_sendQuery`, `_callProductionProcess`, `_callGateway`, `_callLocalProxy`, `_handleMockResponse`)
- Keep: ALL response handling (`_handleResponse`, `_formatStructuredResponse`)
- Keep: ALL POD event handlers (`_onWorklistSelect`, `_onPodSelectionChange`, `_updatePodContext`)
- Keep: Rate limiting, input validation, debug timing

### 3.4 `synKiCopilot/builder/PropertyEditor.js` - Minor Change

- Remove: `dialogMode` switch
- Keep: `useGateway`, `productionProcessKey`, `gatewayUrl`, `gatewayToken`, `showDebugTiming`

### 3.5 `synKiCopilot/i18n/*.properties` - Add Keys

New keys needed:
```
synKiCopilot.welcome.greeting=Hello,
synKiCopilot.welcome.question=How can I assist you?
synKiCopilot.welcome.hint=Talk to me naturally.
synKiCopilot.sidebar.title=Syntax Copilot
synKiCopilot.sidebar.newConversation=New Conversation
synKiCopilot.sidebar.history=History
synKiCopilot.sidebar.noHistory=No conversations yet
synKiCopilot.history.deleteConfirm=Delete this conversation?
synKiCopilot.chip.nc=NC-Meldungen
synKiCopilot.chip.shift=Letzte Schicht
synKiCopilot.chip.downtime=Stillst\u00e4nde
synKiCopilot.chip.top5=Top 5 Gr\u00fcnde
synKiCopilot.chip.quality=Qualit\u00e4t
synKiCopilot.chip.order=Auftragsstatus
```

### 3.6 Files NOT Changed

- `synKiCopilot/Component.js` - No change
- `synKiCopilot/util/Formatter.js` - No change
- `synKiCopilot/util/ResponseParser.js` - No change
- `synKiCopilot/util/ChartRenderer.js` - No change
- `synKiCopilot/model/models.js` - No change
- `synKiCopilot/data/config.json` - No change
- `synKiCopilot/manifest.json` - No change
- `lib/CommonController.js` - No change
- `lib/PluginViewController.js` - No change
- `lib/ProductionUIComponent.js` - No change
- `designer/components.json` - No change

---

## 4. Migration Risk Assessment

| Risk | Mitigation |
|---|---|
| View rewrite breaks POD integration | Component.js + createContent() pattern stays identical. Only view internals change. |
| Chat message rendering breaks | `addBotMessage`, `addDebugMessage`, `setTyping` keep same public API. Internal selectors change but all DOM IDs are controlled by the view. |
| Controller changes break backend | Backend methods are untouched. Only UI-facing methods are added/modified. |
| History storage conflicts with POD | Using sessionStorage (tab-scoped), not localStorage. No risk of cross-tab pollution. |
| CSS conflicts with SAP DM framework | All classes keep `synCopilot` prefix (or change to `aichatbot-` prefix from source). No SAP class names overridden except `.sapMBtnInner` etc. with scoped selectors. |

---

## 5. Version

This redesign bumps the version to **0.9.0**. Update `PLUGIN_VERSION` in `SynKiCopilot.view.js`.
