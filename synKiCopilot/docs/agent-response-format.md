# Agent Response Format - synKiCopilot v4.4

## Overview

The synKiCopilot plugin expects the agent to return a **Markdown-formatted text** in the `output` field. The plugin converts Markdown to HTML and renders it in the chat UI.

## Response Structure

The Production Process returns a JSON object. The agent's response text must be in the `output` field:

```json
{
    "output": "## Heading\n\nMarkdown text here..."
}
```

## Supported Markdown Elements

| Element | Syntax | Example |
|---------|--------|---------|
| Heading 2 | `## Text` | Section headings |
| Heading 3 | `### Text` | Sub-section headings |
| Heading 4 | `#### Text` | Minor headings |
| Bold | `**text**` | **important** |
| Italic | `*text*` | *note* |
| Unordered list | `- item` | Bullet points |
| Ordered list | `1. item` | Numbered steps |
| Inline code | `` `code` `` | Technical terms |
| Horizontal rule | `---` | Section dividers |
| Table | `\| col \| col \|` | Data tables |
| Emojis | Unicode | Direct UTF-8 emojis |

## Tables

Tables use standard Markdown pipe syntax. The second row must be a separator row with `---`:

```markdown
| Column A | Column B | Column C |
|---|---|---|
| Value 1 | Value 2 | Value 3 |
| Value 4 | Value 5 | Value 6 |
```

The first row becomes the table header (styled with blue background).

## Chart Blocks

The agent can embed chart data using fenced code blocks with the `chart` language tag. The plugin extracts these blocks and renders CSS-based bar charts.

### Syntax

````markdown
```chart
{
    "type": "bar",
    "title": "Chart Title",
    "data": [
        { "label": "Label 1", "value": 42 },
        { "label": "Label 2", "value": 28 },
        { "label": "Label 3", "value": 15 }
    ]
}
```
````

### Chart JSON Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | Yes | Chart type. Currently supported: `"bar"` |
| `title` | string | No | Chart title displayed above the bars |
| `data` | array | Yes | Array of data points |
| `data[].label` | string | Yes | Label for each bar (displayed left) |
| `data[].value` | number | Yes | Numeric value (displayed right, bar width proportional) |

### Chart Rendering

- Bar width is proportional to the maximum value (max = 100%)
- Colors cycle through: Blue (#0632A0), Cyan (#1EB4E6), Green (#2ECC71), Orange (#E67E22), Purple (#9B59B6), Red (#E74C3C), Teal (#1ABC9C), Yellow (#F39C12)
- Charts can appear anywhere in the Markdown text (between paragraphs, after headings, etc.)
- Multiple charts per response are supported

## Complete Example

```
## Schichtbericht - Frühschicht 🏭

Die Frühschicht hatte **3 NC-Meldungen** und **1 ungeplanten Stillstand**.

---

### NC-Meldungen

| Zeit | NC Code | Beschreibung | Schwere |
|---|---|---|---|
| 06:15 | NC-001 | Oberflächenfehler | Hoch |
| 08:30 | NC-002 | Maßabweichung | Mittel |
| 10:45 | NC-001 | Oberflächenfehler | Hoch |

### Top NC Codes (letzte 7 Tage)

```chart
{"type":"bar","title":"Top 5 NC Codes","data":[{"label":"NC-001","value":42},{"label":"NC-002","value":28},{"label":"NC-003","value":15},{"label":"NC-004","value":9},{"label":"NC-005","value":5}]}
```

### Empfehlungen

1. **NC-001** tritt gehäuft auf - Werkzeugverschleiß prüfen
2. Stillstand um 07:45 durch Materialengpass - Logistik informieren
3. Qualitätsprüfung für Charge *CH-2026-0412* anfordern

*KI-generiert. Ergebnisse prüfen.*
```

## Important Notes

- The agent should respond in the **same language** as the user's query (no `language` parameter is sent)
- Keep responses concise and relevant to manufacturing context
- Use charts for quantitative data (top N lists, trends, comparisons)
- Use tables for structured data with multiple columns
- Emojis can be used sparingly for visual cues
