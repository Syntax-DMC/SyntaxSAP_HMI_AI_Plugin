# SAP AI Chat - POD Plugin for SAP Digital Manufacturing

Joule-style AI chat assistant plugin for SAP DM Production Operator Dashboard (POD).

## Features

- Joule-inspired purple gradient UI with sparkle icon
- Chat interface with Markdown rendering (tables, charts, code blocks)
- Suggestion chips for quick manufacturing queries (NC, Shift, Downtime, Quality, Order)
- Sidebar with conversation history (sessionStorage)
- CSS bar chart rendering from agent responses
- Multi-language support (DE, EN, FR, ES)
- Configurable backend: Production Process or Gateway API

## Installation

1. ZIP the `synKiCopilot/`, `designer/`, and `lib/` folders
2. Upload as Custom Extension in SAP DM (Manage Custom Extensions)
3. Add "SAP AI Chat" plugin to your POD in POD Designer
4. Configure Production Process Key or Gateway URL in plugin settings

### Extension Settings

| Field | Value |
|---|---|
| Name | `SYN_MAX_AI_Copilot` |
| Namespace | `syntax.max.ai` |
| Description | SAP AI Chat - AI assistant for manufacturing |

## Project Structure

```
synKiCopilot/           # Plugin source code
  controller/           # Controller (backend comm, chat logic, history)
  view/                 # XML View (Joule UI layout)
  css/                  # Joule purple theme CSS
  util/                 # Formatter, ResponseParser, ChartRenderer
  builder/              # POD Designer PropertyEditor
  i18n/                 # Translations (DE, EN, FR, ES)
  data/                 # Environment config (LOCAL/DEV/QA/PRD)
designer/               # SAP DM plugin registration (components.json)
lib/                    # CommonController base + POD Foundation mocks
local/                  # Development proxy server (node proxy.js)
tests/                  # Test cases matrix
docs/                   # Specs and agent response format
```

## Local Development

```bash
node local/proxy.js              # Mock mode (port 5501)
node local/proxy.js --forward    # Forward to real Agent API
```

## Version

0.9.0 - Joule UI redesign with sidebar and conversation history
