# synKiCopilot - Test Cases

Logische Testfälle für manuelle und automatisierte Prüfung.
Bei neuen Features: Testfälle hier ergänzen.

---

## 1. Formatter (util/Formatter.js)

### 1.1 escapeHtml
| # | Eingabe | Erwartetes Ergebnis | Status |
|---|---------|---------------------|--------|
| 1.1.1 | `<script>alert("xss")</script>` | `&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;` | |
| 1.1.2 | `null` | `""` | |
| 1.1.3 | `O'Brien & Co "GmbH"` | `O&#39;Brien &amp; Co &quot;GmbH&quot;` | |
| 1.1.4 | `""` (leerer String) | `""` | |

### 1.2 sanitizeHtml
| # | Eingabe | Prüfung | Status |
|---|---------|---------|--------|
| 1.2.1 | `<script>alert(1)</script>Text` | Script-Tag entfernt, "Text" bleibt | |
| 1.2.2 | `<div onclick="evil()">ok</div>` | onclick entfernt | |
| 1.2.3 | `<a href="javascript:void(0)">link</a>` | href geleert | |
| 1.2.4 | `<iframe src="evil.com"></iframe>` | iframe komplett entfernt | |
| 1.2.5 | `<img src="data:image/svg+xml,...">` | data-src geleert | |
| 1.2.6 | `<p>Normaler Text</p>` | Unverändert | |

### 1.3 markdownToHtml
| # | Eingabe | Erwartetes Ergebnis | Status |
|---|---------|---------------------|--------|
| 1.3.1 | `## Überschrift` | `<h2>Überschrift</h2>` | |
| 1.3.2 | `### Sub` | `<h3>Sub</h3>` | |
| 1.3.3 | `#### Klein` | `<h4>Klein</h4>` | |
| 1.3.4 | `**fett**` | `<strong>fett</strong>` | |
| 1.3.5 | `*kursiv*` | `<em>kursiv</em>` | |
| 1.3.6 | `` `code` `` | `<code>code</code>` | |
| 1.3.7 | `---` | `<hr>` | |
| 1.3.8 | Unordered list (`- Item`) | `<ul><li>Item</li></ul>` | |
| 1.3.9 | Ordered list (`1. Item`) | `<ol><li>Item</li></ol>` | |
| 1.3.10 | Fenced code block | `<pre><code>...</code></pre>` | |
| 1.3.11 | Tabelle mit Header + Daten | `<table>` mit `<th>` und `<td>` | |
| 1.3.12 | Leerer String | `""` | |
| 1.3.13 | Gemischter Content (h2 + Liste + Tabelle + Code) | Korrekt verschachtelt, keine offenen Tags | |

### 1.4 inlineMarkdown
| # | Eingabe | Prüfung | Status |
|---|---------|---------|--------|
| 1.4.1 | `**fett** und *kursiv*` | Beide korrekt konvertiert | |
| 1.4.2 | `<script>` in Eingabe | Wird escaped (escapeHtml wird zuerst aufgerufen) | |

### 1.5 Clickable Suggestions
| # | Eingabe (Listenpunkt) | Erwartung | Status |
|---|----------------------|-----------|--------|
| 1.5.1 | `- "Was ist der NC-Code?"` | `synCopilotSuggestion` span mit data-query | |
| 1.5.2 | `- Wie ist der Status?` | Suggestion erkannt (endet mit ?) | |
| 1.5.3 | `- Normaler Punkt ohne Fragezeichen` | Kein Suggestion-Span | |
| 1.5.4 | `- "Zu kurz"` | Kein Suggestion (< 5 Zeichen stripped) | |

---

## 2. ResponseParser (util/ResponseParser.js)

### 2.1 extractOutput - Standard-Formate
| # | Eingabe | Erwartetes Ergebnis | Status |
|---|---------|---------------------|--------|
| 2.1.1 | `{ output: "## Hallo" }` | `"## Hallo"` | |
| 2.1.2 | `{ response: '{"output": "## Hallo"}' }` (stringified) | `"## Hallo"` | |
| 2.1.3 | `{ response: { output: "## Hallo" } }` (object) | `"## Hallo"` | |
| 2.1.4 | `{ answer: "Antwort" }` (Gateway-Format) | `"Antwort"` | |
| 2.1.5 | `"## Direkt Markdown"` (plain string) | `"## Direkt Markdown"` | |
| 2.1.6 | `null` | `null` | |
| 2.1.7 | `{ errors: [{ message: "Fehler" }] }` | `null` (Errors separat behandelt) | |

### 2.2 extractOutput - Sonderfälle
| # | Eingabe | Prüfung | Status |
|---|---------|---------|--------|
| 2.2.1 | Doppelt verschachteltes `{ response: '{"output": "{\"output\": \"Inhalt\"}"}' }` | Tiefster Output extrahiert | |
| 2.2.2 | Markdown in ` ```json ``` ` Code-Block gewrappt | Code-Block-Wrapper entfernt, JSON geparst | |
| 2.2.3 | Malformed JSON (kaputte Escapes, aber "output" vorhanden) | `extractFromMalformedJson` greift als Fallback | |
| 2.2.4 | Response mit summary-Feld aber ohne output | Summary als Fallback | |

### 2.3 unescapeJsonString
| # | Eingabe | Erwartetes Ergebnis | Status |
|---|---------|---------------------|--------|
| 2.3.1 | `\\n` | Newline | |
| 2.3.2 | `\\t` | Tab | |
| 2.3.3 | `\\"` | `"` | |
| 2.3.4 | `\\u00fc` | `ü` | |
| 2.3.5 | `\\u00e4` | `ä` | |
| 2.3.6 | `\\\\` | `\` | |

### 2.4 extractJsonBlock
| # | Eingabe | Prüfung | Status |
|---|---------|---------|--------|
| 2.4.1 | Text mit ` ```json { "key": "val" } ``` ` | json-Objekt geparst, textBefore/textAfter korrekt | |
| 2.4.2 | Text ohne Code-Block | json = null, textBefore = Input | |
| 2.4.3 | Invalides JSON in Code-Block | json = null | |

---

## 3. ChartRenderer (util/ChartRenderer.js)

### 3.1 extractChartBlocks
| # | Eingabe | Prüfung | Status |
|---|---------|---------|--------|
| 3.1.1 | Markdown mit einem chart-Block | 1 Chart extrahiert, `{{CHART_0}}` Placeholder | |
| 3.1.2 | Markdown mit zwei chart-Blocks | 2 Charts, `{{CHART_0}}` und `{{CHART_1}}` | |
| 3.1.3 | Markdown ohne chart-Block | charts = [], markdown unverändert | |
| 3.1.4 | Invalides JSON im chart-Block | Chart.data = null | |

### 3.2 renderChart
| # | Eingabe | Prüfung | Status |
|---|---------|---------|--------|
| 3.2.1 | 5 Datenpunkte mit Werten | HTML mit 5 Bars, Breiten proportional zum Max | |
| 3.2.2 | Chart mit title | `synCopilotChartTitle` div vorhanden | |
| 3.2.3 | Chart ohne title | Kein Title-Div | |
| 3.2.4 | Leeres data-Array | Leerer String | |
| 3.2.5 | Alle Werte = 0 | Keine Division-by-zero, Bars mit min-width | |
| 3.2.6 | 9+ Datenpunkte | Farben zyklisch wiederholt | |
| 3.2.7 | Label mit HTML-Sonderzeichen (`<script>`) | Escaped via escapeHtml | |

### 3.3 insertChartHtml
| # | Eingabe | Prüfung | Status |
|---|---------|---------|--------|
| 3.3.1 | HTML mit `<p>{{CHART_0}}</p>` | `<p>` Wrapper entfernt, Chart eingefügt | |
| 3.3.2 | HTML mit `{{CHART_0}}` (ohne p-Wrapper) | Chart direkt eingefügt | |

---

## 4. Controller (SynKiCopilot.controller.js)

### 4.1 Environment Detection
| # | Hostname | Erwartetes Ergebnis | Status |
|---|----------|---------------------|--------|
| 4.1.1 | `localhost` | `LOCAL` | |
| 4.1.2 | `127.0.0.1` | `LOCAL` | |
| 4.1.3 | `192.168.1.100` | `LOCAL` | |
| 4.1.4 | `app-dev.sap.com` | `DEV` | |
| 4.1.5 | `app-qa.sap.com` | `QA` | |
| 4.1.6 | `app.sap.com` | `PRD` | |

### 4.2 Query Routing
| # | Bedingung | Erwartetes Routing | Status |
|---|-----------|-------------------|--------|
| 4.2.1 | LOCAL + mockMode=true | `_handleMockResponse` | |
| 4.2.2 | LOCAL + mockMode=false | `_callLocalProxy` | |
| 4.2.3 | DEV + useGateway=true | `_callGateway` | |
| 4.2.4 | DEV + useGateway=false + PP-Key | `_callProductionProcess` | |
| 4.2.5 | DEV + useGateway=false + kein PP-Key | Fehlermeldung "Kein PP Key" | |

### 4.3 Rate Limiting
| # | Szenario | Prüfung | Status |
|---|----------|---------|--------|
| 4.3.1 | Zwei Queries < 2000ms apart | Zweite wird gedrosselt | |
| 4.3.2 | Zwei Queries > 2000ms apart | Beide werden verarbeitet | |

### 4.4 Input Validation
| # | Szenario | Prüfung | Status |
|---|----------|---------|--------|
| 4.4.1 | Leerer Input | Nicht gesendet | |
| 4.4.2 | Input > 5000 Zeichen | Warnung, nicht gesendet | |
| 4.4.3 | Normaler Input | Gesendet | |

### 4.5 Gateway Mode
| # | Szenario | Prüfung | Status |
|---|----------|---------|--------|
| 4.5.1 | Gateway URL ohne HTTPS | Fehlermeldung "HTTPS erforderlich" | |
| 4.5.2 | Gateway URL leer | Fehlermeldung "Keine URL" | |
| 4.5.3 | Gateway Token leer | Fehlermeldung "Kein Token" | |
| 4.5.4 | SFC wechselt | Context-Call an /gw/data, dann Chat an /gw/agent | |
| 4.5.5 | SFC unverändert | Nur Chat an /gw/agent (kein Context-Call) | |
| 4.5.6 | Gateway URL mit `/gw/agent` Suffix | Suffix wird gestrippt, Base-URL korrekt | |
| 4.5.7 | Timeout (> 120s) | Timeout-Fehlermeldung | |

### 4.6 Production Process Mode
| # | Szenario | Prüfung | Status |
|---|----------|---------|--------|
| 4.6.1 | Kein SFC ausgewählt | Fehlermeldung "SFC auswählen" | |
| 4.6.2 | Erfolgreiche PP-Antwort | Response via _handleResponse verarbeitet | |
| 4.6.3 | PP-Fehler mit HTTP-Code | User-freundliche Fehlermeldung | |

### 4.7 Response Pipeline (Ende-zu-Ende)
| # | Eingabe (Agent-Antwort) | Prüfung | Status |
|---|------------------------|---------|--------|
| 4.7.1 | Plain Markdown | Korrekt gerendert (h2, Listen, Tabellen) | |
| 4.7.2 | Markdown mit chart-Block | Chart als CSS-Balkendiagramm gerendert | |
| 4.7.3 | Structured JSON (mit summary, timeline, insights) | Alle Felder als HTML dargestellt | |
| 4.7.4 | Error-Response `{ errors: [...] }` | Fehlermeldung angezeigt | |
| 4.7.5 | Leere/null Response | "Keine Antwort erhalten" | |
| 4.7.6 | Malformed JSON mit output | Output trotzdem extrahiert | |

### 4.8 Debug Timing
| # | Szenario | Prüfung | Status |
|---|----------|---------|--------|
| 4.8.1 | showDebugTiming=true | Debug-Bubble mit Anfrage/Antwort/Dauer | |
| 4.8.2 | showDebugTiming=false | Keine Debug-Bubble | |

---

## 5. View (SynKiCopilot.view.js)

### 5.1 Display Modes
| # | Szenario | Prüfung | Status |
|---|----------|---------|--------|
| 5.1.1 | dialogMode=false (Standard) | Sidepanel mit Header, Tags, Chat, Input, Disclaimer | |
| 5.1.2 | dialogMode=true | Launcher-Button sichtbar, Dialog öffnet sich auf Klick | |
| 5.1.3 | Dialog: Send via Enter | Nachricht gesendet, Input geleert | |
| 5.1.4 | Dialog: Send via Button | Nachricht gesendet, Input geleert | |

### 5.2 Chat Verhalten
| # | Szenario | Prüfung | Status |
|---|----------|---------|--------|
| 5.2.1 | Erste Nachricht | Welcome-Message verschwindet | |
| 5.2.2 | User-Nachricht | Rechts ausgerichtet, Gradient-Hintergrund | |
| 5.2.3 | Bot-Nachricht | Links ausgerichtet, weißer Hintergrund | |
| 5.2.4 | Typing-Indicator an | Spinner + Typewriter-Text sichtbar | |
| 5.2.5 | Typing-Indicator aus | Spinner + Typewriter verschwunden | |
| 5.2.6 | Scroll nach neuer Nachricht | Chat scrollt automatisch nach unten | |

### 5.3 Quick Action Tags
| # | Tag | Prüfung | Status |
|---|-----|---------|--------|
| 5.3.1 | NC | Sendet "Erkläre den aktuellen NC-Code" | |
| 5.3.2 | Schicht | Sendet "Was ist in der letzten Schicht passiert?" | |
| 5.3.3 | Ausfall | Sendet "Welche Stillstände gab es zuletzt?" | |
| 5.3.4 | Top 5 | Sendet "Was sind die häufigsten Stillstandsgründe?" | |
| 5.3.5 | Qualität | Sendet "Welche Qualitätsthemen sind offen?" | |
| 5.3.6 | Auftrag | Sendet "Wie ist der aktuelle Auftragsstatus?" | |

### 5.4 Context Display
| # | Szenario | Prüfung | Status |
|---|----------|---------|--------|
| 5.4.1 | POD-Selection mit plant, SFC, WC, Resource | Header zeigt "PLT: X | SFC: Y | WC: Z | RES: W" | |
| 5.4.2 | Nur Plant vorhanden | Header zeigt nur "PLT: X" | |
| 5.4.3 | Kein Kontext | Header-Kontext leer | |

---

## 6. CSS / Dark Mode

### 6.1 Light Mode
| # | Prüfung | Status |
|---|---------|--------|
| 6.1.1 | Header hat blauen Gradient (#0632A0 → #1EB4E6) | |
| 6.1.2 | User-Bubble hat Gradient, weiße Schrift | |
| 6.1.3 | Bot-Bubble ist weiß mit Schatten | |
| 6.1.4 | Tabellen-Header ist blau (#0632A0) mit weißer Schrift | |
| 6.1.5 | Chart-Bars haben farbige Füllung auf grauem Track | |

### 6.2 Dark Mode (html[data-sap-ui-theme*="dark"])
| # | Prüfung | Status |
|---|---------|--------|
| 6.2.1 | Hintergrund dunkel (#1c2228) | |
| 6.2.2 | Bot-Bubble dunkel (#29333d), helle Schrift | |
| 6.2.3 | Tags dunkel (#2e3840), Hover = Accent | |
| 6.2.4 | Code-Blöcke dunkel, Accent-Farbe für inline Code | |
| 6.2.5 | Input-Bereich dunkel (#232a31) | |
| 6.2.6 | Tabellen: gerade Zeilen #232a31 | |

### 6.3 Accessibility
| # | Prüfung | Status |
|---|---------|--------|
| 6.3.1 | Tab-Navigation: focus-visible Outline auf Tags, Send-Button, Input | |
| 6.3.2 | prefers-reduced-motion: Spinner-Animation gestoppt | |
| 6.3.3 | prefers-reduced-motion: Chart-Bar-Transition deaktiviert | |
| 6.3.4 | Chat-Bereich hat `role="log"` und `aria-live="polite"` | |
| 6.3.5 | Input hat `aria-label` gesetzt | |

---

## 7. Proxy (local/proxy.js)

### 7.1 Mock-Modus
| # | Szenario | Prüfung | Status |
|---|----------|---------|--------|
| 7.1.1 | POST /api/query mit query-Text | Mock-Antwort mit Markdown + Chart | |
| 7.1.2 | Query enthält "NC" | NC-spezifische Mock-Antwort | |
| 7.1.3 | Query enthält "Schicht" | Schicht-spezifische Mock-Antwort | |
| 7.1.4 | Query enthält "Stillstand"/"Ausfall" | Downtime Mock-Antwort | |
| 7.1.5 | Beliebige Frage | Generische Mock-Antwort | |
| 7.1.6 | CORS-Header gesetzt | Access-Control-Allow-Origin: * | |

### 7.2 Forward-Modus
| # | Szenario | Prüfung | Status |
|---|----------|---------|--------|
| 7.2.1 | Forward an konfigurierte Agent-URL | Request korrekt weitergeleitet | |
| 7.2.2 | Agent antwortet mit JSON | Response 1:1 durchgereicht | |
| 7.2.3 | Agent nicht erreichbar | 502 mit Fehlermeldung | |
| 7.2.4 | Agent Timeout | Timeout-Fehler weitergegeben | |

---

## 8. i18n

### 8.1 Sprachunterstützung
| # | Sprache | Prüfung | Status |
|---|---------|---------|--------|
| 8.1.1 | Deutsch (de) | Alle Keys vorhanden und korrekt | |
| 8.1.2 | Englisch (en) | Alle Keys vorhanden | |
| 8.1.3 | Französisch (fr) | Alle Keys vorhanden | |
| 8.1.4 | Spanisch (es) | Alle Keys vorhanden | |
| 8.1.5 | Fallback bei fehlendem Key | Key-Name ohne Prefix angezeigt | |

---

## 9. Sidebar + Conversation History (v0.9.0)

### 9.1 Sidebar
| # | Szenario | Prüfung | Status |
|---|----------|---------|--------|
| 9.1.1 | Hamburger-Button Klick | Sidebar fährt von links rein (280px), Overlay sichtbar | |
| 9.1.2 | Overlay Klick | Sidebar schließt, Overlay verschwindet | |
| 9.1.3 | Sidebar Close-Button Klick | Sidebar schließt | |

### 9.2 Conversation History
| # | Szenario | Prüfung | Status |
|---|----------|---------|--------|
| 9.2.1 | Neue Nachricht senden | sessionStorage wird aktualisiert | |
| 9.2.2 | Seite neu laden | Nachrichten aus sessionStorage wiederhergestellt | |
| 9.2.3 | "Neues Gespräch" klicken | Aktuelles Gespräch in History, Chat leer, Welcome sichtbar | |
| 9.2.4 | History-Eintrag klicken | Gespräch geladen, Welcome versteckt | |
| 9.2.5 | History-Eintrag löschen | Eintrag entfernt, Liste aktualisiert | |
| 9.2.6 | 21+ Gespräche | Nur die neuesten 20 behalten | |
| 9.2.7 | Leere History | "Noch keine Gespräche" angezeigt | |
| 9.2.8 | Tab schließen | sessionStorage gelöscht (Browser-Standard) | |

### 9.3 Welcome Screen (Joule)
| # | Szenario | Prüfung | Status |
|---|----------|---------|--------|
| 9.3.1 | Initial Load | Lila Gradient, Sparkle Icon, Greeting, Hint Card | |
| 9.3.2 | Erste Nachricht senden | Welcome + Chips verschwinden | |
| 9.3.3 | "Neues Gespräch" | Welcome + Chips erscheinen wieder | |
| 9.3.4 | Sparkle SVG | 120x120px, weiße Pfade, zentriert | |

### 9.4 Suggestion Chips
| # | Chip | Prüfung | Status |
|---|------|---------|--------|
| 9.4.1 | NC-Meldungen | Sendet "Erkläre den aktuellen NC-Code" | |
| 9.4.2 | Letzte Schicht | Sendet "Was ist in der letzten Schicht passiert?" | |
| 9.4.3 | Stillstände | Sendet "Welche Stillstände gab es zuletzt?" | |
| 9.4.4 | Top 5 Gründe | Sendet "Was sind die häufigsten Stillstandsgründe?" | |
| 9.4.5 | Qualität | Sendet "Welche Qualitätsthemen sind offen?" | |
| 9.4.6 | Auftragsstatus | Sendet "Wie ist der aktuelle Auftragsstatus?" | |
| 9.4.7 | Chip Klick | Welcome verschwindet, Query wird gesendet | |

### 9.5 Joule UI Visuell
| # | Prüfung | Status |
|---|---------|--------|
| 9.5.1 | Header: Lila Gradient (#5B4FD6 → #7C5FE8) mit Hamburger + Titel | |
| 9.5.2 | Welcome: Lila Gradient (#6366F1 → #7C3AED → #A855F7) | |
| 9.5.3 | User-Bubble: Lila Gradient, weiße Schrift | |
| 9.5.4 | Bot-Bubble: Hellgrau (#f8f8f8), dunkle Schrift | |
| 9.5.5 | Input: Pill-Form, 2px lila Border, runder Send-Button | |
| 9.5.6 | Chips: Lila Text (#5B4FD6), hellvioletter Hover (#f0ecff) | |
| 9.5.7 | Tabellen: Lila Gradient-Header | |
| 9.5.8 | Charts: Lila Akzentfarbe (#5B4FD6) | |
