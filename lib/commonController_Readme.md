# CommonController.js - Vollständige Dokumentation

**Datei:** `synMessagePlugin/lib/CommonController.js`
**Version:** 1.0
**Autor:** itneubu
**Erstellt:** 26.09.2025

## Übersicht

Der `CommonController` ist die zentrale Basisklasse für alle Plugin-Controller im SynMessage-Projekt. Er erweitert den SAP DM `PluginViewController` und stellt wiederverwendbare Funktionen bereit für:

- Konfigurationsmanagement (Umgebung, Registry-Werte)
- REST API und Datenbank-Aufrufe
- Production Process Aufrufe
- POD-Selektion (SFC, Operation, Resource, etc.)
- Nachrichten-Anzeige (Toast, MessageBox)
- Datums-Formatierung
- Scanner-Unterstützung
- E-Mail-Versand
- POD-Refresh und Event-Publishing

**Vererbungskette:**
```
sap.dm.dme.podfoundation.controller.PluginViewController
  └── CommonController
        └── SynMessagePlugin.controller.js (oder andere Plugin-Controller)
```

**Verwendung im Controller:**
```js
sap.ui.define([
  "syntax/custom/extension/synMessagePlugin/lib/CommonController"
], function (CommonController) {
  "use strict";

  return CommonController.extend("syntax.custom.extension.synMessagePlugin.controller.MeinPlugin", {
    // Alle Funktionen des CommonController sind hier verfügbar
  });
});
```

---

## Inhaltsverzeichnis

1. [Konstanten](#1-konstanten)
2. [Lifecycle-Funktionen](#2-lifecycle-funktionen)
3. [Konfiguration und Umgebung](#3-konfiguration-und-umgebung)
4. [Internationalisierung (i18n)](#4-internationalisierung-i18n)
5. [HTML Encoding/Decoding](#5-html-encodingdecoding)
6. [Logger](#6-logger)
7. [Datums-Funktionen](#7-datums-funktionen)
8. [Scanner-Funktionen](#8-scanner-funktionen)
9. [Busy Indicator Watchdog](#9-busy-indicator-watchdog)
10. [Nachrichten-Anzeige](#10-nachrichten-anzeige)
11. [Datenbank-Aufrufe](#11-datenbank-aufrufe)
12. [REST API Aufrufe](#12-rest-api-aufrufe)
13. [Production Process Aufrufe](#13-production-process-aufrufe)
14. [Error Handling](#14-error-handling)
15. [E-Mail-Funktionen](#15-e-mail-funktionen)
16. [Plugin-Funktionen](#16-plugin-funktionen)
17. [POD-Selektion](#17-pod-selektion)
18. [POD-Refresh und Events](#18-pod-refresh-und-events)

---

## 1. Konstanten

### Deployment

| Konstante | Wert | Beschreibung |
|---|---|---|
| `DEPLOY_PATH` | `/sapdmdmepod/~...~/dme/podfoundation-ms/Extensions/SYN_Message_Plugin` | Pfad zur deployed Extension auf dem DM-Server |
| `DEPLOY_VERSION` | `""` | Wird zur Laufzeit aus dem Extension-Manifest geladen |

### Production Process

| Konstante | Wert | Beschreibung |
|---|---|---|
| `PRODUCTION_PROCESS_BASE` | `"api/v1/process/processDefinitions"` | API-Basispfad für Production Process Definitionen |
| `PROD_PROC_LOG_LEVEL` | `"Error"` | Standard Log-Level für PP-Aufrufe |

### SFC-Status Codes

| Konstante | Wert | Beschreibung |
|---|---|---|
| `SFC_STATE_NEW` | `"401"` | Neu angelegt |
| `SFC_STATE_INQUEUE` | `"402"` | In Warteschlange |
| `SFC_STATE_ACTIVE` | `"403"` | Aktiv (in Bearbeitung) |
| `SFC_STATE_HOLED` | `"404"` | Angehalten |
| `SFC_STATE_DONE` | `"405"` | Fertig |
| `SFC_STATE_DONE_OLD` | `"406"` | Fertig (alt) |
| `SFC_STATE_SCRAPPED` | `"407"` | Verschrottet |

### SFC-Status Icons und Farben

| Konstante | Wert | Beschreibung |
|---|---|---|
| `SFC_STATE_ICON_ACTIVE` | `"sap-icon://color-fill"` | Icon fuer aktiven SFC |
| `SFC_STATE_ICON_NOT_ACTIVE` | `"sap-icon://initiative"` | Icon fuer nicht-aktiven SFC |
| `SFC_STATE_ICON_COMPLETE` | `"sap-icon://complete"` | Icon fuer fertigen SFC |
| `SFC_STATE_COLOR_ACTIVE` | `"green"` | Farbe aktiv |
| `SFC_STATE_COLOR_NOT_ACTIVE` | `"red"` | Farbe nicht aktiv |
| `SFC_STATE_COLOR_COMPLETE` | `"green"` | Farbe fertig |

---

## 2. Lifecycle-Funktionen

### `onInit()`

Wird beim Initialisieren des Controllers aufgerufen. Fuehrt folgende Schritte aus:
1. Ruft `PluginViewController.onInit()` auf (Basisklasse)
2. Laedt die Konfiguration via `initConfigModel()`
3. Ermittelt das aktuelle Werk (Plant) ueber `getPodController().getUserPlant()`

```js
// Wird automatisch aufgerufen. Im erbenden Controller:
onInit: function() {
    // CommonController.onInit aufrufen (optional, wenn ueberschrieben)
    CommonController.prototype.onInit.apply(this, arguments);

    // Eigene Initialisierung
    console.log("Mein Plugin gestartet");
}
```

### `onExit()`

Wird beim Zerstoeren der View aufgerufen. Ruft den `onExit()` der Basisklasse auf.

```js
onExit: function() {
    // Eigene Aufräumarbeiten
    notificationService.unsubscribe();

    // Basisklasse aufrufen
    CommonController.prototype.onExit.apply(this, arguments);
}
```

---

## 3. Konfiguration und Umgebung

### `initConfigModel()`

Laedt die Plugin-Konfiguration vom DM-Server in zwei Schritten:

1. Laedt das Extension-Manifest von `DEPLOY_PATH` -> ermittelt `DEPLOY_VERSION`
2. Laedt die `config.json` von `{DEPLOY_PATH}/{VERSION}/files/synMessagePlugin/data/config.json`
3. Speichert das Ergebnis in `this.configObject`

Wird automatisch in `onInit()` aufgerufen.

**Erwartete config.json Struktur:**
```json
{
  "DEV": {
    "dmcHost": "dev-hostname.sap.com",
    "appUrl": "https://dev-app-url.com"
  },
  "QA": {
    "dmcHost": "qa-hostname.sap.com",
    "appUrl": "https://qa-app-url.com"
  },
  "PRD": {
    "dmcHost": "prd-hostname.sap.com",
    "appUrl": "https://prd-app-url.com"
  }
}
```

### `getEnv()`

Ermittelt die aktuelle Umgebung (DEV, QA, PRD) anhand des Browser-Hostnamens.

**Rueckgabe:** `"DEV"`, `"QA"` oder `"PRD"` (Fallback: `"DEV"`)

```js
var env = this.getEnv();
// env = "DEV" | "QA" | "PRD"
```

**Logik:** Vergleicht `window.location.hostname` mit den `dmcHost`-Werten aus der `config.json`.

### `getPpRegistryValue(sRegKey)`

Liest einen Konfigurationswert aus der `config.json` fuer die aktuelle Umgebung.

| Parameter | Typ | Beschreibung |
|---|---|---|
| `sRegKey` | `string` | Schluesselname in der config.json |

**Rueckgabe:** Der Wert aus `configObject[env][sRegKey]`

```js
// config.json: { "DEV": { "appUrl": "https://dev.example.com" } }
var appUrl = this.getPpRegistryValue("appUrl");
// appUrl = "https://dev.example.com" (wenn Umgebung = DEV)
```

---

## 4. Internationalisierung (i18n)

### `getI18nText(stringKey, ...args)`

Liest einen uebersetzten Text aus dem i18n-Model. Unterstuetzt Platzhalter-Ersetzung.

| Parameter | Typ | Beschreibung |
|---|---|---|
| `stringKey` | `string` | i18n-Schluessel |
| `...args` | `string` | Optionale Platzhalter-Werte fuer `{1}`, `{2}`, etc. |

**Rueckgabe:** Uebersetzter Text oder der Schluessel selbst als Fallback.

```js
// i18n.properties: Z_COMPLETE_ORDER=Produktionsauftrag {1} abschliessen?

var text = this.getI18nText("Z_COMPLETE_ORDER", "450000123");
// text = "Produktionsauftrag 450000123 abschliessen?"

var simple = this.getI18nText("ERROR_TITLE");
// simple = "Fehler"
```

**Hinweis:** Die Platzhalter beginnen bei `{1}` (nicht `{0}`).

### `getCurrentLanguage()`

Gibt die aktuelle Sprache des Browsers/SAP zurueck.

**Rueckgabe:** Sprachcode als String (z.B. `"de"`, `"en"`)

```js
var lang = this.getCurrentLanguage();
// lang = "de"
```

---

## 5. HTML Encoding/Decoding

### `decodeHtml(htmlEncodedString)`

Dekodiert HTML-Entities zurueck in lesbaren Text.

| Ersetzung | Von | Nach |
|---|---|---|
| `&lt;` / `&amp;lt;` | `<` | `<` |
| `&gt;` / `&amp;gt;` | `>` | `>` |
| `&quot;` / `&amp;quot;` | `'` | `'` |
| `&#x2F;` | `/` | `/` |

```js
var decoded = this.decodeHtml("&lt;div&gt;Hallo&lt;/div&gt;");
// decoded = "<div>Hallo</div>"
```

### `encodeHtml(htmlString)`

Kodiert HTML-Zeichen in sichere Entities. Entfernt Zeilenumbrueche und Tabs.

```js
var encoded = this.encodeHtml("<script>alert('XSS')</script>");
// encoded = "&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;"
```

---

## 6. Logger

### `createLogger(sLoggerName)`

Erstellt einen benannten Logger mit Log-Level INFO.

| Parameter | Typ | Beschreibung |
|---|---|---|
| `sLoggerName` | `string` | Name des Loggers (erscheint in der Konsole) |

**Rueckgabe:** jQuery.sap.log Logger-Instanz

```js
var logger = this.createLogger("MeinPlugin");
logger.info("Plugin gestartet");
logger.error("Etwas ist schiefgelaufen");
logger.warning("Achtung");
```

---

## 7. Datums-Funktionen

### `formatDateUtc(date)`

Formatiert ein Date-Objekt als UTC-String.

**Rueckgabe:** `"yyyy-MM-ddTHH:mm:ssZ"`

```js
var now = new Date();
var utc = this.formatDateUtc(now);
// utc = "2025-09-26T14:30:00Z"
```

### `formatDate(date)`

Formatiert ein Date-Objekt als lokalen Datums-String (ohne Z-Suffix).

**Rueckgabe:** `"yyyy-MM-ddTHH:mm:ss"`

```js
var now = new Date();
var local = this.formatDate(now);
// local = "2025-09-26T16:30:00"
```

### `formatDateFromDbToBrowser(date)`

Konvertiert ein Datenbank-Datumsformat in das Browser-Anzeigeformat.

| Parameter | Typ | Beschreibung |
|---|---|---|
| `date` | `string` | Datum im Format `"yyyy-MM-ddTHH:mm:ssZ"` |

**Rueckgabe:** Formatiertes Datum gemaess i18n-Key `DATETIME_FORMAT`

```js
var display = this.formatDateFromDbToBrowser("2025-09-26T14:30:00Z");
// display = "26.09.2025 16:30:00" (abhaengig von DATETIME_FORMAT)
```

### `formatDateFromPatternToPattern(date, sFromPattern, sToPattern)`

Konvertiert ein Datum von einem Pattern in ein anderes.

```js
var result = this.formatDateFromPatternToPattern(
    "26.09.2025",
    "dd.MM.yyyy",
    "yyyy-MM-dd"
);
// result = "2025-09-26"
```

### `getDisplayFormat()`

Gibt das Anzeige-Datumsformat aus i18n zurueck (Key: `DATETIME_FORMAT`).

```js
var format = this.getDisplayFormat();
// format = "dd.MM.yyyy HH:mm:ss"
```

### `convertTDateToUtcTDate(tDateString)`

Konvertiert einen Datums-String in einen UTC-Datums-String.

```js
var utc = this.convertTDateToUtcTDate("2025-09-26T16:30:00");
// utc = "2025-09-26T14:30:00Z"
```

### `calculateDuration(oDateStart, oDateEnd)`

Berechnet die Differenz zwischen zwei Datums-Objekten als Zeitdauer.

**Rueckgabe:** `"HH:mm:ss"` (z.B. `"02:15:30"`) oder `"00:00:00"` bei negativer Differenz.

```js
var start = new Date("2025-09-26T08:00:00");
var end   = new Date("2025-09-26T10:30:45");
var duration = this.calculateDuration(start, end);
// duration = "02:30:45"
```

---

## 8. Scanner-Funktionen

### `scanningSettingsObject`

Konfigurationsobjekt fuer Barcode-Scanner:

| Eigenschaft | Standardwert | Beschreibung |
|---|---|---|
| `lastScanTime` | `0` | Zeitstempel des letzten Scans |
| `lastScannedBarcode` | `""` | Letzter gescannter Barcode |
| `timeBeforeScanTest` | `3000` | Wartezeit (ms) nach Keypress bevor Scan-Test |
| `startChar` | `[120]` | Char-Code fuer Scan-Start (z.B. 120 fuer OPL6845R) |
| `endChar` | `[13]` | Char-Code fuer Scan-Ende (Enter) |
| `avgTimeByChar` | `3000` | Durchschnittliche Zeit (ms) zwischen Zeichen |
| `minLength` | `3` | Minimale Scan-Laenge |
| `stopPropagation` | `true` | Event-Propagation stoppen |
| `preventDefault` | `true` | Default-Action verhindern |

### `preventDuplicateScannedString(barcode, qty, scanElement)`

Verhindert doppelte Scan-Verarbeitung innerhalb von 1 Sekunde.

| Parameter | Typ | Beschreibung |
|---|---|---|
| `barcode` | `string` | Gescannter Barcode |
| `qty` | `number` | Menge |
| `scanElement` | `object` | UI-Element, das den Scan ausgeloest hat |

**Rueckgabe:** `true` = neuer Scan, `false` = Duplikat (ignorieren)

```js
if (this.preventDuplicateScannedString(barcode, 1, oInput)) {
    // Neuer Scan - verarbeiten
    this.processScan(barcode);
} else {
    // Duplikat - ignorieren
    console.log("Doppelter Scan ignoriert");
}
```

---

## 9. Busy Indicator Watchdog

### `startBusyIndicatorWatchdog(timeout)`

Startet einen Timer, der den BusyIndicator nach Ablauf automatisch ausblendet. Schuetzt vor "haengenden" BusyIndicators.

| Parameter | Typ | Standard | Beschreibung |
|---|---|---|---|
| `timeout` | `number` | `300000` (5 Min.) | Timeout in Millisekunden |

```js
BusyIndicator.show(200);
this.startBusyIndicatorWatchdog(10000); // 10 Sekunden Watchdog

// ... API-Aufruf ...

BusyIndicator.hide(); // Normalerweise im Callback
// Falls Callback nie kommt: Watchdog blendet nach 10s automatisch aus
```

---

## 10. Nachrichten-Anzeige

### `showMessagePopup(message, successFlag, timeout)`

Router-Funktion fuer Nachrichten basierend auf einem Flag.

| Parameter | Typ | Standard | Beschreibung |
|---|---|---|---|
| `message` | `string` | - | Nachrichtentext |
| `successFlag` | `number` | - | `0` = Error, `1` = Success, anderer Wert = Warning |
| `timeout` | `number` | `5000` | Anzeigedauer in ms |

```js
this.showMessagePopup("Auftrag gespeichert", 1);        // Success Toast
this.showMessagePopup("Validierungsfehler", 0);          // Error Popup
this.showMessagePopup("Achtung: Bestand niedrig", 2);    // Warning Toast
```

### `showSuccessMessage(message, timeout)`

Zeigt einen Success-Toast (Standard: 5 Sekunden).

```js
this.showSuccessMessage("Auftrag erfolgreich gebucht");
this.showSuccessMessage("Gespeichert", 3000); // 3 Sekunden
```

### `showWarningMessage(message, timeout)`

Zeigt einen Warning-Toast mit CSS-Klasse `warningMessageToast` (Standard: 10 Sekunden). Auf kleinen Bildschirmen (<700px) wird die Breite auf 95% gesetzt.

```js
this.showWarningMessage("Material fast aufgebraucht");
```

### `showErrorMessage(message, timeout)`

Zeigt einen Error-Toast mit CSS-Klasse `errorMessageToast` (Standard: 10 Sekunden). Auf kleinen Bildschirmen (<700px) wird die Breite auf 95% gesetzt.

```js
this.showErrorMessage("Verbindung zum Server fehlgeschlagen", 15000);
```

### `showErrorMessagePopup(message)`

Zeigt einen blockierenden Error-Dialog (MessageBox). Der Titel wird aus i18n-Key `ERROR_TITLE` geladen.

```js
this.showErrorMessagePopup("Kritischer Fehler: Daten konnten nicht gespeichert werden.");
```

### `showWarningMessagePopup(message)`

Zeigt einen blockierenden Warning-Dialog (MessageBox). Der Titel wird aus i18n-Key `WARNING_TITLE` geladen.

```js
this.showWarningMessagePopup("Warnung: Ungueltige Eingabe erkannt.");
```

---

## 11. Datenbank-Aufrufe

### `doDatabaseCallGet(sTableUrl, filter, sModelName, callBackFunction)`

Fuehrt einen GET-Aufruf gegen die App-URL (aus config.json) aus.

| Parameter | Typ | Beschreibung |
|---|---|---|
| `sTableUrl` | `string` | Tabellen-/Endpunkt-Pfad |
| `filter` | `string` | OData-Filter-String |
| `sModelName` | `string` | Name des JSONModels fuer die View |
| `callBackFunction` | `function` | Callback bei Erfolg: `function(controller, response)` |

**Aufgerufene URL:** `{appUrl}{sTableUrl}{filter}`

**Rueckgabe:** `Promise`

```js
var filter = "?$filter=werks eq '1000'";

this.doDatabaseCallGet(
    "/Mapping/mapping/MaterialData",
    filter,
    "MaterialModel",
    function(controller, response) {
        console.log("Daten geladen:", response);
        // Daten stehen jetzt in getView().getModel("MaterialModel")
    }
).then(function(response) {
    // Promise-basiert
}).catch(function(err) {
    console.error("Fehler:", err);
});
```

---

## 12. REST API Aufrufe

### `createRestApiCallParams(inputParametersObject)`

Wandelt ein Parameter-Objekt in einen URL-Query-String um.

```js
var queryString = this.createRestApiCallParams({
    plant: "1000",
    sfc: "SFC_001",
    resource: "RES_01"
});
// queryString = "?plant=1000&sfc=SFC_001&resource=RES_01"
```

### `doRestApiCallGet(sApiUrl, params, sModelName, callBackFunction)`

Fuehrt einen GET-Aufruf gegen die SAP DM Public API aus.

| Parameter | Typ | Beschreibung |
|---|---|---|
| `sApiUrl` | `string` | API-Endpunkt (relativ zur publicApiRestDataSourceUri) |
| `params` | `object` | Query-Parameter als Key-Value-Objekt |
| `sModelName` | `string` | Name des JSONModels fuer die View |
| `callBackFunction` | `function` | Callback: `function(controller, responseData, originalParams)` |

**Aufgerufene URL:** `{publicApiRestDataSourceUri}{sApiUrl}?{params}`

**URI-Ermittlung:** `getPublicApiRestDataSourceUri()` aus dem POD-Framework. Fallback: `getView().getViewData().publicApiRestDataSourceUri`.

```js
this.doRestApiCallGet(
    "sfc/v1/sfcs",
    { plant: "1000", sfc: "SFC_001" },
    "SfcDetailModel",
    function(controller, data, params) {
        if (data) {
            console.log("SFC-Details:", data);
        } else {
            console.log("Fehler oder keine Daten");
        }
    }
);
```

### Callback-Signatur

```js
function callBackFunction(controller, responseData, originalParams)
```

| Parameter | Bei Erfolg | Bei Fehler |
|---|---|---|
| `controller` | `this`-Referenz | `this`-Referenz |
| `responseData` | Response-Objekt | `""` (leerer String) |
| `originalParams` | Uebergebene params | Uebergebene params |

---

## 13. Production Process Aufrufe

### `getPPLogLevel()`

Gibt den Log-Level fuer Production Process Aufrufe zurueck.

**Rueckgabe:** `"Error"` (Standardwert aus `PROD_PROC_LOG_LEVEL`)

### `doProductionProcessCallPost(prodProcRegKey, params, sModelName, callBackFunction)`

**Kernfunktion:** Startet einen Production Process ueber die SAP DM Process Engine API.

| Parameter | Typ | Beschreibung |
|---|---|---|
| `prodProcRegKey` | `string` | Registry-Key der Production Process Definition |
| `params` | `object` | Eingabeparameter als JSON-Body |
| `sModelName` | `string` | Name des JSONModels fuer die Response |
| `callBackFunction` | `function` | Callback bei Erfolg und Fehler |

**Aufgerufene URL:**
```
{peRestDataSourceUri}/pe/api/v1/process/processDefinitions/start?key={prodProcRegKey}&async=false&logLevel=Error
```

- **HTTP-Methode:** `POST`
- **Body:** `params` als JSON
- **`async=false`:** Synchroner Aufruf (wartet auf PP-Ergebnis)

**URI-Ermittlung:** `getPeRestDataSourceUri()` aus dem POD-Framework (Process Engine REST Data Source). Fallback: `getView().getViewData().peRestDataSourceUri`.

### Callback-Signatur

```js
function callBackFunction(controller, responseData, errorDetails, originalParams)
```

| Parameter | Bei Erfolg | Bei Fehler |
|---|---|---|
| `controller` | `this`-Referenz | `this`-Referenz |
| `responseData` | Response-Objekt | `null` |
| `errorDetails` | `null` | `oError.details` |
| `originalParams` | Uebergebene params | Uebergebene params |

### Beispiel: Production Process starten

```js
// Einfacher Aufruf
this.doProductionProcessCallPost(
    "PP_COMPLETE_ORDER",
    {
        ORDER: "450000123",
        PLANT: "1000"
    },
    "PPResultModel",
    function(controller, responseData, errorDetails, originalParams) {
        if (responseData) {
            console.log("PP erfolgreich:", responseData);
            controller.showSuccessMessage("Production Process gestartet");
            controller.refreshPODLists(); // POD aktualisieren
        } else {
            console.error("PP fehlgeschlagen:", errorDetails);
            controller.showErrorMessage("Production Process fehlgeschlagen");
        }
    }
);
```

### Beispiel: Decision-Dialog mit PP-Trigger

So wird es im `SynMessagePlugin.controller.js` verwendet:

```js
_triggerProductionProcess: function (params) {
    var prodProc = params.PROD_PROC;

    if (!prodProc) {
        console.log("Kein PROD_PROC - kein Follow-up");
        return;
    }

    // PP_* Parameter extrahieren (Prefix entfernen)
    var ppParams = {};
    Object.keys(params).forEach(function(key) {
        if (key.startsWith("PP_")) {
            ppParams[key.substring(3)] = params[key];
        }
    });
    // PP_ORDER -> ORDER, PP_PLANT -> PLANT

    this.doProductionProcessCallPost(
        prodProc,           // "PP_COMPLETE_ORDER"
        ppParams,           // { ORDER: "450000123", PLANT: "1000" }
        "PPTriggerResult",
        function(controller, responseData, errorDetails, originalParams) {
            if (responseData) {
                controller.showSuccessMessage("PP " + prodProc + " gestartet");
            } else {
                controller.showErrorMessage("PP " + prodProc + " fehlgeschlagen");
            }
        }
    );
},
```

### Event-Parameter Format (Notification Event -> PP-Trigger)

```js
// Eingehende Event-Parameter:
parameters: [
    { name: "FLAG",       value: "3" },                 // QUESTION
    { name: "KEY",        value: "Z_COMPLETE_ORDER" },   // i18n-Key
    { name: "PROD_PROC",  value: "PP_COMPLETE_ORDER" },  // PP-Key
    { name: "PP_ORDER",   value: "450000123" },           // -> ORDER
    { name: "PP_PLANT",   value: "1000" }                 // -> PLANT
]

// Ablauf:
// 1. FLAG=3 -> Decision-Dialog anzeigen
// 2. Operator klickt OK -> _triggerProductionProcess(params)
// 3. PP_* Prefix entfernen -> { ORDER: "450000123", PLANT: "1000" }
// 4. doProductionProcessCallPost("PP_COMPLETE_ORDER", ppParams, ...)
// 5. POST an: {peUri}/api/v1/process/processDefinitions/start?key=PP_COMPLETE_ORDER&async=false&logLevel=Error
```

### Ablaufdiagramm

```
Controller
  |
  v
doProductionProcessCallPost(regKey, params, modelName, callback)
  |
  ├── getPeRestDataSourceUri()                  -> Process Engine Base-URI
  ├── URL: {uri}/api/v1/.../start?key=...       -> URL zusammenbauen
  ├── ajaxPostRequest(url, params)              -> POST mit JSON-Body
  |
  ├── Erfolg:
  |   ├── BusyIndicator.hide()
  |   ├── Response -> JSONModel -> View
  |   └── callback(this, responseData, null, params)
  |
  └── Fehler:
      ├── BusyIndicator.hide()
      ├── getAjaxRequestErrorInfo() -> Fehlermeldung parsen
      └── callback(this, null, errorDetails, params)
```

---

## 14. Error Handling

### `getAjaxRequestErrorInfo(actionMessageText, oError, sHttpErrorMessage)`

Erstellt eine lesbare Fehlermeldung aus einem Ajax-Error-Objekt.

| Parameter | Typ | Beschreibung |
|---|---|---|
| `actionMessageText` | `string` | Praefix-Text (z.B. `"ERROR on PP_COMPLETE_ORDER"`) |
| `oError` | `object` | SAP DM Error-Objekt |
| `sHttpErrorMessage` | `string` | HTTP-Fehlermeldung |

**Rueckgabe:** Formatierter Fehlertext

```js
var msg = this.getAjaxRequestErrorInfo("Fehler beim Buchen", oError, "Internal Server Error");
// msg = "Fehler beim Buchen\n\nUser does not have SFC in work (Message 13901)\n\nHttp Error Message: Internal Server Error"
```

### `getRequestErrorInfo(oError, errorMessageKey)`

Parst das verschachtelte SAP DM Error-Objekt und extrahiert die relevante Fehlermeldung. Unterstuetzt verschiedene Error-Formate:

- `oError.message` + `oError.code`
- `oError.displayMessage`
- `oError.errorMessageKey`
- `oError.details[].httpResponseBody` (JSON-Parsing)
- `oError.error.message` + `oError.error.code`
- `oError.error.details[].httpResponseBody`

```js
// Typisches SAP DM Error-Objekt:
var oError = {
    error: {
        message: "SFC nicht gefunden",
        code: "13901",
        details: [{
            httpResponseBody: '{"error":{"message":"SFC IM_0006 nicht gefunden","causeMessage":null,"code":"13901"}}',
            httpResponseCode: 404
        }]
    }
};

var msg = this.getRequestErrorInfo(oError, "Error Code");
// msg = "SFC IM_0006 nicht gefunden\n\nError Code: 13901 (404)"
```

---

## 15. E-Mail-Funktionen

### `getMailRecipients(jsonShiftBookCategoryMail)`

Extrahiert E-Mail-Adressen aus einem ShiftBook-Category-Mail-Response-Objekt.

**Rueckgabe:** Semikolon-separierte E-Mail-Adressen

```js
var response = {
    value: [
        { mail_address: "user1@example.com" },
        { mail_address: "user2@example.com" }
    ]
};
var recipients = this.getMailRecipients(response);
// recipients = "user1@example.com; user2@example.com; "
```

### `sendMailByCategory(category, subject, message)`

Sendet eine E-Mail an alle Empfaenger einer ShiftBook-Kategorie.

| Parameter | Typ | Beschreibung |
|---|---|---|
| `category` | `number` | Kategorie-ID aus dem ShiftBook |
| `subject` | `string` | E-Mail-Betreff |
| `message` | `string` | E-Mail-Text |

**Rueckgabe:** `Promise`

**Ablauf:**
1. Laedt Empfaenger von `{appUrl}/Mapping/mapping/ShiftBookCategoryMail?$filter=werks eq '{plant}' and category eq {category}`
2. Ruft `sendMailByRecipients()` mit den geladenen Empfaengern auf

```js
this.sendMailByCategory(
    1,
    "Stoerung an Linie 3",
    "Bitte pruefen: Maschine XY hat einen Fehler gemeldet."
).then(function() {
    console.log("Mail gesendet");
});
```

### `sendMailByRecipients(mailRecipients, subject, message)`

Sendet eine E-Mail ueber den Mailer-Service.

| Parameter | Typ | Beschreibung |
|---|---|---|
| `mailRecipients` | `string` | Semikolon-separierte E-Mail-Adressen |
| `subject` | `string` | E-Mail-Betreff |
| `message` | `string` | E-Mail-Text |

**Rueckgabe:** `Promise`

**Aufgerufene URL:** `{appUrl}/Mailer/sendMail` (POST)

```js
this.sendMailByRecipients(
    "admin@example.com; support@example.com",
    "Alarm",
    "Kritischer Fehler in Produktion"
).then(function() {
    console.log("Mail versendet");
});
```

---

## 16. Plugin-Funktionen

### `isPopupModalPlugin()`

Prueft ob das aktuelle Plugin als modales Popup konfiguriert ist.

**Rueckgabe:** `true` wenn `configuration.type === "popup_modal"`, sonst `false`

```js
if (this.isPopupModalPlugin()) {
    // Modal-spezifische Logik
    this.closeDialog();
}
```

### `isSfcStateActive()`

Prueft ob der aktuell selektierte SFC im Status "Aktiv" (403) ist.

**Rueckgabe:** `true` wenn Status = `"403"`, sonst `false`

```js
if (!this.isSfcStateActive()) {
    this.showErrorMessage("SFC muss aktiv sein fuer diese Aktion");
    return;
}
// SFC ist aktiv - Aktion ausfuehren
```

---

## 17. POD-Selektion

### `getCurrentSelection()`

Liest alle aktuell im POD selektierten Objekte aus und gibt sie als strukturiertes Objekt zurueck.

**Rueckgabe:**
```js
{
    sfcId: "SFC_001",              // Selektierter SFC
    sfcQuantity: "100",            // SFC-Menge
    sfcResourceId: "RES_01",       // Resource am SFC
    shopOrderId: "ORD_001",        // Fertigungsauftrag
    operationId: "OP_010",         // Operation
    operationStepId: "STEP_1",     // Schritt-ID
    operationDesc: "Montage",      // Beschreibung
    resourceId: "RES_01",          // Resource (aus Operation oder POD)
    workCenterId: "WC_001",        // Arbeitsplatz
    materialId: "MAT_001",         // Material
    orderBatch: "BATCH_001",       // Chargennummer
    version: "1",                  // Version
    routing: "ROUTING_001",        // Arbeitsplan
    routingVersion: "1",           // Arbeitsplan-Version
    routingType: "PRODUCTION"      // Arbeitsplan-Typ
}
```

```js
var sel = this.getCurrentSelection();

if (sel.sfcId) {
    console.log("Selektierter SFC:", sel.sfcId);
    console.log("Operation:", sel.operationId);
    console.log("Resource:", sel.resourceId);
} else {
    console.log("Kein SFC selektiert");
}
```

### `isValidPodSelection(oPodSelection)`

Prueft ob ein POD-Selektionsobjekt gueltig ist (mindestens sfcId vorhanden).

```js
var sel = this.getCurrentSelection();
if (this.isValidPodSelection(sel)) {
    // SFC ist selektiert - weitermachen
    this.processOrder(sel);
} else {
    this.showErrorMessage("Bitte zuerst einen SFC auswaehlen");
}
```

### `getCurrentUserId()`

Gibt die aktuelle Benutzer-ID zurueck.

**Rueckgabe:** User-ID als String

```js
var userId = this.getCurrentUserId();
// userId = "OPERATOR_01"
```

---

## 18. POD-Refresh und Events

### `refreshPODLists()`

Aktualisiert alle POD-Listen (Worklist, Operationlist) und sendet ein Select-Event.

```js
// Nach einer Buchung die POD-Listen aktualisieren
this.doProductionProcessCallPost("PP_CONFIRM", params, "ConfirmModel",
    function(controller, response) {
        if (response) {
            controller.refreshPODLists(); // Alle Listen neu laden
        }
    }
);
```

### `sendWorklistSelectEvent()`

Sendet ein `WorklistSelectEvent` an den POD Event-Bus.

```js
this.sendWorklistSelectEvent();
// Publiziert: "WorklistSelectEvent" auf dem Event-Bus
```

### `resfreshWorklist()`

Sendet ein `WorklistRefreshEvent` an den POD Event-Bus, um die Worklist neu zu laden.

```js
this.resfreshWorklist();
```

### `resfreshOperationlist()`

Sendet ein `OperationChangeEvent` an den POD Event-Bus, um die Operationsliste neu zu laden.

```js
this.resfreshOperationlist();
```

### `sendFinishedExecutionEvent()`

Sendet ein `FinishedExecutionEvent` an den POD Event-Bus. Signalisiert, dass die Plugin-Ausfuehrung abgeschlossen ist.

```js
// Nach Abschluss einer Aktion
this.sendFinishedExecutionEvent();
```

### `sendKpiRefreshStateChangeEvent(refreshDisabled)`

Steuert den KPI-Plugin-Refresh. Kann den automatischen Refresh aktivieren oder deaktivieren.

| Parameter | Typ | Beschreibung |
|---|---|---|
| `refreshDisabled` | `boolean` | `true` = Refresh deaktivieren, `false` = aktivieren |

```js
// Refresh waehrend einer Buchung deaktivieren
this.sendKpiRefreshStateChangeEvent(true);

// Buchung durchfuehren ...

// Refresh wieder aktivieren
this.sendKpiRefreshStateChangeEvent(false);
```

### `sendWorklistSelectSfcEvent(sfcId, operationId, resourceId, workCenterId)`

Selektiert einen bestimmten SFC in der POD-Worklist programmatisch.

| Parameter | Typ | Beschreibung |
|---|---|---|
| `sfcId` | `string` | SFC-Nummer |
| `operationId` | `string` | Operation |
| `resourceId` | `string` | Resource |
| `workCenterId` | `string` | Arbeitsplatz |

**Aufgerufene URL:** `{publicApiRestDataSourceUri}sfc/v1/sfcselect` (POST)

**Hinweis:** Alle vier Parameter muessen angegeben sein, sonst wird der Aufruf uebersprungen.

```js
this.sendWorklistSelectSfcEvent(
    "SFC_001",     // sfcId
    "OP_010",      // operationId
    "RES_01",      // resourceId
    "WC_001"       // workCenterId
);
// POST an: {uri}/sfc/v1/sfcselect mit Body:
// { plant: "1000", operation: "OP_010", sfc: "SFC_001", resource: "RES_01", workCenter: "WC_001" }
```

---

## Voraussetzungen

- Der Controller muss von `CommonController` erben (nicht direkt von `PluginViewController`)
- Die POD-Framework URIs (`peRestDataSourceUri`, `publicApiRestDataSourceUri`) werden automatisch vom SAP DM POD bereitgestellt
- Die `config.json` muss pro Umgebung (DEV/QA/PRD) korrekt konfiguriert sein
- Die i18n-Properties muessen die verwendeten Keys enthalten (`ERROR_TITLE`, `WARNING_TITLE`, `DATETIME_FORMAT`, etc.)
