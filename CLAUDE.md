# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**synKiCopilot** is an SAP Digital Manufacturing (DM) POD (Production Operator Dashboard) plugin that provides an AI-powered copilot chat interface for manufacturing operators. It sends user queries to an AI agent (via Production Process or Gateway API) and renders Markdown responses with embedded CSS bar charts in a chat UI.

Version: 0.9.0 | Namespace: `syntax.max.ai.synKiCopilot`

## Architecture

### Inheritance Chain
```
sap.dm.dme.podfoundation.controller.PluginViewController (SAP DM framework)
  └── CommonController (lib/CommonController.js - shared base for all Syntax plugins)
        └── SynKiCopilot.controller.js (plugin controller)
```

### Key Components

- **Controller** (`synKiCopilot/controller/SynKiCopilot.controller.js`): Main logic - POD event handling, backend communication (3 modes: mock, local proxy, Production Process, Gateway), response processing, chat state management.
- **View** (`synKiCopilot/view/SynKiCopilot.view.js`): JS View (not XML - required for synchronous `ProductionUIComponent.createContent()`). Builds Joule-style UI programmatically with `sap.m` controls + raw HTML. Includes sidebar, welcome screen with sparkle icon, suggestion chips, purple gradient chat bubbles.
- **Component** (`synKiCopilot/Component.js`): Extends `ProductionUIComponent`, uses `sap.ui.jsview` (deprecated but required for POD plugin sync view creation).
- **PropertyEditor** (`synKiCopilot/builder/PropertyEditor.js`): POD Designer configuration panel. Configurable properties: `useGateway`, `productionProcessKey`, `gatewayUrl`, `gatewayToken`, `showDebugTiming`.

### Utility Modules (`synKiCopilot/util/`)

- **Formatter.js**: HTML escaping, `sanitizeHtml` (defense-in-depth before innerHTML), Markdown-to-HTML conversion (headings, tables, lists, code blocks, inline formatting). Detects clickable suggestion patterns in list items.
- **ResponseParser.js**: Extracts `output` field from various backend response formats - handles stringified JSON, malformed JSON, nested wrapping, Gateway `{answer}` format. `extractDeepestOutput` is the nuclear fallback (scans for all `"output"` keys, returns longest Markdown).
- **ChartRenderer.js**: Extracts ` ```chart ` fenced code blocks from Markdown, replaces with `{{CHART_N}}` placeholders, renders CSS-based horizontal bar charts.

### lib/ Directory

- **CommonController.js**: Shared base controller for all Syntax SAP DM plugins. **DO NOT MODIFY** - used across multiple plugins. Provides config management, REST/DB calls, Production Process calls, POD selection, i18n, scanner support.
- **PluginViewController.js** / **ProductionUIComponent.js**: Mock implementations of SAP DM POD Foundation classes for local development.

### Backend Communication Modes

The controller routes queries based on environment detection:
1. **LOCAL + mockMode**: Returns hardcoded mock response
2. **LOCAL + !mockMode**: Calls local proxy at `config.json → LOCAL.localProxyUrl` (default: `http://localhost:5501/api/query`)
3. **Gateway mode** (POD Designer `useGateway=true`): Two-step flow - POST `/gw/data` (context), POST `/gw/agent` (query). Uses `session_id` for correlation. Context only sent on SFC change.
4. **Production Process** (default for DEV/QA/PRD): Calls via `doProductionProcessCallPost` with PP registry key from POD Designer config.

### Response Flow

Agent response → `ResponseParser.extractOutput()` → `ChartRenderer.extractChartBlocks()` (extracts chart JSON, inserts placeholders) → `Formatter.markdownToHtml()` → `ChartRenderer.insertChartHtml()` → `Formatter.sanitizeHtml()` → rendered in chat bubble via DOM injection.

## Configuration

- **`synKiCopilot/data/config.json`**: Environment-specific settings (LOCAL/DEV/QA/PRD). Controls `useProductionProcess`, `localProxyUrl`, `mockMode`.
- **POD Designer properties**: `useGateway`, `productionProcessKey`, `gatewayUrl`, `gatewayToken`, `showDebugTiming`.
- **`designer/components.json`**: Plugin registration. Supported POD types: WORK_CENTER, OPERATION, OTHER, ORDER.

## i18n

Fallback locale is `de` (German). Supported: de, de-DE, en, fr, es. Builder i18n keys use `synKiCopilot.` prefix. The view has hardcoded German fallback texts in `_getText()`.

## Important Constraints

- `sap.ui.jsview` is deprecated but **required** - modern async alternatives are incompatible with `ProductionUIComponent.createContent()`.
- Bot messages use direct DOM `innerHTML` injection (not `sap.ui.core.HTML`) because the SAP control silently fails for some HTML content. Always sanitize via `Formatter.sanitizeHtml()`.
- The SAP DM Dynatrace fetch wrapper is incompatible with `AbortController.signal` - timeouts use `Promise.race` instead.
- `lib/CommonController.js` is shared across plugins - do not modify it for plugin-specific logic. Use `_pluginConfig` (not `configObject`) for plugin-specific config to avoid overwriting the base controller's config.
- Gateway tokens and API keys must be masked in all log output.

## CSS Architecture (`synKiCopilot/css/style.css`)

Joule-style purple gradient theme (ported 1:1 from aichatbot_plugin):
- **Colors**: Primary `#5B4FD6`, welcome gradient `#6366F1 → #7C3AED → #A855F7`, header gradient `#5B4FD6 → #7C5FE8`, user bubbles `#6366F1 → #8B5CF6`, bot bubbles `#f8f8f8`.
- All classes prefixed with `synCopilot` (camelCase) to avoid SAP DM style collisions.
- **Sidebar**: 280px slide-in panel with `synCopilotSlideIn` animation, semi-transparent overlay.
- **Suggestion chips**: Purple text/border, light purple hover.
- **Accessibility**: `focus-visible` outlines using `#5B4FD6`, `prefers-reduced-motion` disables animations.
- SAP UI5 control overrides use `!important` on `.sapMBtnInner`, `.sapMInputBaseInner` etc.
- No dark mode currently (can be added later).

## Sidebar + Conversation History

- **Sidebar**: Opens via hamburger menu in header, 280px slide-in from left, overlay click to close.
- **History**: Stored in `sessionStorage` (tab-scoped, cleared on tab close). Keys: `synkicopilot_messages` (current), `synkicopilot_history` (saved conversations). Max 20 entries.
- **New Conversation**: Saves current chat to history, clears chat, shows welcome screen.

## Local Development

### Proxy Server (`local/proxy.js`)

Zero-dependency Node.js proxy for local testing:

```bash
node local/proxy.js                  # Mock mode (default, port 5501)
node local/proxy.js --forward        # Forward to real Agent API
node local/proxy.js --port 8080      # Custom port
```

- **Mock mode**: Returns realistic Markdown responses with charts, tables, suggestions based on query keywords (NC, Schicht, Stillstand, Top, Auftrag).
- **Forward mode**: Proxies requests to a real Agent API configured in `local/proxy-config.json`.
- Plugin's `config.json` LOCAL.localProxyUrl should point to `http://localhost:5501/api/query`.

### Test Cases (`tests/TEST_CASES.md`)

Comprehensive test matrix covering all modules. Update when adding new features.

## Agent Response Format

The agent returns Markdown in an `output` JSON field. Supports: headings (h2-h4), bold, italic, lists, tables, inline code, horizontal rules, and ` ```chart ` blocks for CSS bar charts. See `synKiCopilot/docs/agent-response-format.md` for full specification.
