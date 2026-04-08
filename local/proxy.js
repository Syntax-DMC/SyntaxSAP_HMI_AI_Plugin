/**
 * synKiCopilot - Local Development Proxy
 *
 * Two modes:
 *   MOCK mode (default): Returns realistic mock responses for UI testing.
 *   FORWARD mode:        Forwards requests to a real Agent API.
 *
 * Usage:
 *   node proxy.js                  → Mock mode on port 5501
 *   node proxy.js --forward        → Forward mode (configure in proxy-config.json)
 *   node proxy.js --port 8080      → Custom port
 *
 * The plugin's config.json LOCAL.localProxyUrl should point to:
 *   http://localhost:5501/api/query
 */

const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");

// ==================== CONFIGURATION ====================

const DEFAULT_PORT = 5501;
const CONFIG_FILE = path.join(__dirname, "proxy-config.json");

// Parse CLI args
const args = process.argv.slice(2);
const forwardMode = args.includes("--forward");
const portIndex = args.indexOf("--port");
const port = portIndex !== -1 ? parseInt(args[portIndex + 1], 10) : DEFAULT_PORT;

// Load forward config if needed
let forwardConfig = null;
if (forwardMode) {
    if (fs.existsSync(CONFIG_FILE)) {
        forwardConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8"));
        console.log("Forward config loaded:", CONFIG_FILE);
    } else {
        // Create template config
        const template = {
            agentUrl: "https://your-agent-api.example.com/api/query",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": "YOUR_API_KEY_HERE"
            },
            timeoutMs: 120000
        };
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(template, null, 4));
        console.error("No proxy-config.json found. Template created - please fill in your Agent API details.");
        process.exit(1);
    }
}

// ==================== MOCK RESPONSES ====================

/**
 * Returns a mock response based on query keywords.
 * Covers all response formats the plugin needs to handle:
 * - Markdown with headings, tables, lists, bold, italic, code
 * - Chart blocks
 * - Clickable suggestions
 */
function getMockResponse(query) {
    const q = (query || "").toLowerCase();

    // NC-related queries
    if (q.includes("nc") || q.includes("nonconformance") || q.includes("qualit")) {
        return {
            output: "## NC-Analyse \uD83D\uDD0D\n\n" +
                "Für den aktuellen SFC wurden **3 NC-Meldungen** in den letzten 24 Stunden erfasst.\n\n" +
                "---\n\n" +
                "### Aktuelle NC-Meldungen\n\n" +
                "| Zeit | NC Code | Beschreibung | Schwere |\n" +
                "|---|---|---|---|\n" +
                "| 06:15 | NC-001 | Oberflächenfehler an Position 3 | Hoch |\n" +
                "| 08:30 | NC-002 | Maßabweichung +0.3mm | Mittel |\n" +
                "| 10:45 | NC-001 | Oberflächenfehler an Position 7 | Hoch |\n\n" +
                "### Häufigkeit (letzte 7 Tage)\n\n" +
                "```chart\n" +
                JSON.stringify({
                    type: "bar",
                    title: "Top NC Codes - letzte 7 Tage",
                    data: [
                        { label: "NC-001", value: 42 },
                        { label: "NC-002", value: 28 },
                        { label: "NC-003", value: 15 },
                        { label: "NC-004", value: 9 },
                        { label: "NC-005", value: 5 }
                    ]
                }) + "\n```\n\n" +
                "### Empfehlungen\n\n" +
                "1. **NC-001** tritt gehäuft auf - Werkzeugverschleiß prüfen\n" +
                "2. Maßabweichung bei NC-002 könnte auf Kalibrierungsdrift hindeuten\n" +
                "3. Qualitätsprüfung für Charge *CH-2026-0412* anfordern\n\n" +
                "### Weiterführende Fragen\n\n" +
                "- \"Welche Maschine hat die meisten NC-001 Meldungen?\"\n" +
                "- \"Gibt es einen Trend bei Oberflächenfehlern?\"\n" +
                "- \"Wann wurde das Werkzeug zuletzt gewechselt?\"\n\n" +
                "*Syntax Copilot schlägt vor – der Mensch entscheidet.*"
        };
    }

    // Shift queries
    if (q.includes("schicht") || q.includes("shift")) {
        return {
            output: "## Schichtbericht - Frühschicht \uD83C\uDFED\n\n" +
                "Die Frühschicht (06:00–14:00) hatte **3 NC-Meldungen**, **1 ungeplanten Stillstand** und eine OEE von **78.5%**.\n\n" +
                "---\n\n" +
                "### Zeitverlauf\n\n" +
                "| Zeit | Ereignis | Details |\n" +
                "|---|---|---|\n" +
                "| 06:15 | NC-Meldung | Oberflächenfehler (NC-001) |\n" +
                "| 07:45 | Stillstand | Materialengpass - 23 Min |\n" +
                "| 08:30 | NC-Meldung | Maßabweichung (NC-002) |\n" +
                "| 09:00 | Wiederanlauf | Produktion fortgesetzt |\n" +
                "| 10:45 | NC-Meldung | Oberflächenfehler (NC-001) |\n" +
                "| 13:30 | Schichtende | Alle Aufträge abgeschlossen |\n\n" +
                "### OEE-Vergleich\n\n" +
                "```chart\n" +
                JSON.stringify({
                    type: "bar",
                    title: "OEE letzte 5 Schichten (%)",
                    data: [
                        { label: "Mo Früh", value: 82 },
                        { label: "Mo Spät", value: 75 },
                        { label: "Di Früh", value: 88 },
                        { label: "Di Spät", value: 71 },
                        { label: "Mi Früh", value: 79 }
                    ]
                }) + "\n```\n\n" +
                "### Zusammenfassung\n\n" +
                "- Verfügbarkeit: **91.2%** (Ziel: 95%)\n" +
                "- Leistung: **86.1%**\n" +
                "- Qualität: **99.8%**\n\n" +
                "*Syntax Copilot schlägt vor – der Mensch entscheidet.*"
        };
    }

    // Downtime queries
    if (q.includes("stillstand") || q.includes("ausfall") || q.includes("downtime")) {
        return {
            output: "## Stillstandsanalyse \u26A0\uFE0F\n\n" +
                "In den letzten 48 Stunden gab es **4 Stillstände** mit einer Gesamtdauer von **2h 15min**.\n\n" +
                "---\n\n" +
                "### Stillstände\n\n" +
                "| Beginn | Dauer | Grund | Geplant |\n" +
                "|---|---|---|---|\n" +
                "| Mi 07:45 | 23 Min | Materialengpass | Nein |\n" +
                "| Mi 12:00 | 45 Min | Geplante Wartung | Ja |\n" +
                "| Di 15:30 | 38 Min | Werkzeugbruch | Nein |\n" +
                "| Di 09:15 | 29 Min | Sensorstörung | Nein |\n\n" +
                "### Top Stillstandsgründe\n\n" +
                "```chart\n" +
                JSON.stringify({
                    type: "bar",
                    title: "Stillstände nach Grund (Minuten)",
                    data: [
                        { label: "Material", value: 67 },
                        { label: "Werkzeug", value: 52 },
                        { label: "Sensor", value: 38 },
                        { label: "Wartung", value: 45 },
                        { label: "Sonstige", value: 12 }
                    ]
                }) + "\n```\n\n" +
                "### Empfehlungen\n\n" +
                "1. **Materialengpass**: Logistik über wiederholte Engpässe informieren\n" +
                "2. **Werkzeugbruch**: Präventive Werkzeugwechsel-Intervalle prüfen\n" +
                "3. **Sensorstörung**: Sensor an Station 4 hat 3x in einer Woche ausgelöst\n\n" +
                "*Syntax Copilot schlägt vor – der Mensch entscheidet.*"
        };
    }

    // Top 5 / statistics
    if (q.includes("top") || q.includes("häufig") || q.includes("statistik")) {
        return {
            output: "## Top 5 Stillstandsgründe \uD83D\uDCCA\n\n" +
                "Analyse der letzten 30 Tage für den aktuellen Arbeitsplatz.\n\n" +
                "```chart\n" +
                JSON.stringify({
                    type: "bar",
                    title: "Top 5 Stillstandsgründe (Stunden)",
                    data: [
                        { label: "Materialengpass", value: 18 },
                        { label: "Werkzeugwechsel", value: 14 },
                        { label: "Rüsten", value: 11 },
                        { label: "Sensorstörung", value: 8 },
                        { label: "IT-Systeme", value: 5 }
                    ]
                }) + "\n```\n\n" +
                "### Trend\n\n" +
                "- **Materialengpass** ist um **+15%** gestiegen vs. Vormonat\n" +
                "- **IT-Systeme** Stillstände sind **-40%** gesunken (nach Netzwerk-Upgrade)\n" +
                "- **Werkzeugwechsel** stabil\n\n" +
                "*Syntax Copilot schlägt vor – der Mensch entscheidet.*"
        };
    }

    // Order status
    if (q.includes("auftrag") || q.includes("order") || q.includes("status")) {
        return {
            output: "## Auftragsstatus \uD83C\uDFED\n\n" +
                "### Aktueller Auftrag: **ORD-2026-04587**\n\n" +
                "| Eigenschaft | Wert |\n" +
                "|---|---|\n" +
                "| Material | MAT-4711-A |\n" +
                "| Soll-Menge | 500 Stk |\n" +
                "| Ist-Menge | 342 Stk |\n" +
                "| Fortschritt | 68.4% |\n" +
                "| Start | 08.04.2026 06:00 |\n" +
                "| Geplantes Ende | 08.04.2026 18:00 |\n\n" +
                "### Fortschritt nach Operation\n\n" +
                "```chart\n" +
                JSON.stringify({
                    type: "bar",
                    title: "Operationen (% abgeschlossen)",
                    data: [
                        { label: "OP10 Drehen", value: 100 },
                        { label: "OP20 Fräsen", value: 100 },
                        { label: "OP30 Schleifen", value: 68 },
                        { label: "OP40 Prüfen", value: 0 },
                        { label: "OP50 Verpacken", value: 0 }
                    ]
                }) + "\n```\n\n" +
                "### Prognose\n\n" +
                "Bei aktuellem Tempo wird der Auftrag voraussichtlich um **16:45** abgeschlossen (1:15 vor Plan).\n\n" +
                "*Syntax Copilot schlägt vor – der Mensch entscheidet.*"
        };
    }

    // Generic fallback - covers all Markdown features for testing
    return {
        output: "## Antwort auf Ihre Frage\n\n" +
            "Ihre Frage: **" + (query || "–").substring(0, 100) + "**\n\n" +
            "---\n\n" +
            "### Zusammenfassung\n\n" +
            "Dies ist eine **Mock-Antwort** des lokalen Proxy-Servers. " +
            "Der echte Agent ist nicht verbunden.\n\n" +
            "### Verfügbare Quick Actions\n\n" +
            "- \"Erkläre den aktuellen NC-Code\"\n" +
            "- \"Was ist in der letzten Schicht passiert?\"\n" +
            "- \"Welche Stillstände gab es zuletzt?\"\n" +
            "- \"Was sind die häufigsten Stillstandsgründe?\"\n" +
            "- \"Wie ist der aktuelle Auftragsstatus?\"\n\n" +
            "### Demo-Daten\n\n" +
            "| Feature | Status |\n" +
            "|---|---|\n" +
            "| Markdown | `funktioniert` |\n" +
            "| Tabellen | Ja |\n" +
            "| Charts | Ja |\n" +
            "| Suggestions | Ja |\n\n" +
            "```chart\n" +
            JSON.stringify({
                type: "bar",
                title: "Demo-Chart",
                data: [
                    { label: "Feature A", value: 85 },
                    { label: "Feature B", value: 62 },
                    { label: "Feature C", value: 41 }
                ]
            }) + "\n```\n\n" +
            "*Syntax Copilot schlägt vor – der Mensch entscheidet.*"
    };
}

// ==================== FORWARD LOGIC ====================

function forwardRequest(body, res) {
    const url = new URL(forwardConfig.agentUrl);
    const isHttps = url.protocol === "https:";
    const client = isHttps ? https : http;

    const options = {
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname + url.search,
        method: "POST",
        headers: Object.assign({}, forwardConfig.headers || {}, {
            "Content-Type": "application/json"
        }),
        timeout: forwardConfig.timeoutMs || 120000
    };

    console.log("[FORWARD] →", options.hostname + options.path);

    const proxyReq = client.request(options, function (proxyRes) {
        let data = "";
        proxyRes.on("data", function (chunk) { data += chunk; });
        proxyRes.on("end", function () {
            console.log("[FORWARD] ←", proxyRes.statusCode, data.substring(0, 200));
            res.writeHead(proxyRes.statusCode, {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            });
            res.end(data);
        });
    });

    proxyReq.on("error", function (err) {
        console.error("[FORWARD] ERROR:", err.message);
        res.writeHead(502, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
        res.end(JSON.stringify({ error: { message: "Proxy forward error: " + err.message } }));
    });

    proxyReq.on("timeout", function () {
        proxyReq.destroy();
        res.writeHead(504, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
        res.end(JSON.stringify({ error: { message: "Agent timeout (" + (forwardConfig.timeoutMs || 120000) + "ms)" } }));
    });

    proxyReq.write(JSON.stringify(body));
    proxyReq.end();
}

// ==================== SERVER ====================

const server = http.createServer(function (req, res) {
    // CORS preflight
    if (req.method === "OPTIONS") {
        res.writeHead(204, {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, x-api-key"
        });
        res.end();
        return;
    }

    // Health check
    if (req.method === "GET" && req.url === "/") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({
            status: "ok",
            mode: forwardMode ? "forward" : "mock",
            version: "1.0.0"
        }));
        return;
    }

    // Main endpoint
    if (req.method === "POST" && req.url === "/api/query") {
        let body = "";
        req.on("data", function (chunk) { body += chunk; });
        req.on("end", function () {
            let parsed;
            try {
                parsed = JSON.parse(body);
            } catch (e) {
                res.writeHead(400, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
                res.end(JSON.stringify({ error: { message: "Invalid JSON body" } }));
                return;
            }

            console.log("[" + new Date().toLocaleTimeString() + "] POST /api/query" +
                " | query: \"" + (parsed.query || "").substring(0, 80) + "\"" +
                " | plant: " + (parsed.plant || "-") +
                " | sfc: " + (parsed.sfc || "-") +
                " | mode: " + (forwardMode ? "FORWARD" : "MOCK"));

            if (forwardMode) {
                forwardRequest(parsed, res);
            } else {
                // Simulate agent delay (800-2000ms)
                const delay = 800 + Math.random() * 1200;
                setTimeout(function () {
                    const mockResponse = getMockResponse(parsed.query);
                    res.writeHead(200, {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*"
                    });
                    res.end(JSON.stringify(mockResponse));
                }, delay);
            }
        });
        return;
    }

    // 404
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: { message: "Not found. Use POST /api/query" } }));
});

server.listen(port, function () {
    console.log("");
    console.log("  synKiCopilot Proxy v1.0.0");
    console.log("  ─────────────────────────");
    console.log("  Mode:     " + (forwardMode ? "FORWARD → " + forwardConfig.agentUrl : "MOCK"));
    console.log("  URL:      http://localhost:" + port + "/api/query");
    console.log("  Health:   http://localhost:" + port + "/");
    console.log("");
    if (!forwardMode) {
        console.log("  Mock keywords: NC, Schicht, Stillstand/Ausfall, Top/Häufig, Auftrag/Order");
        console.log("  Use --forward for real Agent API forwarding");
    }
    console.log("");
});
