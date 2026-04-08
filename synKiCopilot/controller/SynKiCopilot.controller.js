/* syntax.max.ai.synKiCopilot.controller.SynKiCopilot.controller.js
Version: 0.8.1b
Erstellt: 27.1.2026

Changelog:
26.2.2026 0.8.1b Optimization: Context-Call (/gw/data) nur bei SFC-Wechsel, nicht bei jeder Nachricht. _sLastSentSfc trackt letzten gesendeten SFC.
26.2.2026 0.8.0b Feature: Two-Step Gateway flow - Step 1: POST /gw/data sendet Context (plant, sfc, workcenter, resource + session_id), Step 2: POST /gw/agent sendet nur User-Frage (text + session_id). Stabile session_id pro Plugin-Instanz. Gateway-URL wird automatisch auf Base-URL normalisiert.
19.2.2026 0.7.3b Fix: Gateway fetch timeout von 30s auf 120s erhoeht (Agent-Antworten koennen laenger dauern)
18.2.2026 0.7.2b Fix: Gateway payload format auf Agent Studio ExecuteAgentRequest umgestellt (input array statt question field), Response-Handling via ResponseParser (Gateway ist Pass-Through, keine Transformation)
18.2.2026 0.7.1b Fix: Gateway fetch timeout via Promise.race statt AbortController (Dynatrace fetch wrapper in SAP DM inkompatibel mit signal property, verursachte 400 Bad Request)
18.2.2026 0.7.0b Quality: Extracted util modules (Formatter, ResponseParser, ChartRenderer), security fixes (HTTPS enforcement, rate limit, input validation, sanitizeHtml), fetch timeout (AbortController 30s), ARIA accessibility, CSS focus-visible/reduced-motion, QUnit tests (~65), ESLint config, constants block, requestAnimationFrame scroll
12.2.2026 0.6.2b Fix: Gateway payload simplified to {question, plant, sfc, workCenter, resource}, Gateway transforms to Agent format, response via {answer: "..."}
12.2.2026 0.6.1b Fix: Gateway payload structure (x-api-key header, JSON.stringify'd text with meta/uiContext/userQuery), removed language from meta
12.2.2026 0.6.0b Feature: Gateway mode - direct Agent API call via Gateway (bypass Production Process), configurable in POD Designer (Switch, URL, Token), token security (masked in logs)
11.2.2026 0.5.8b Fix: Direct Markdown response handling (PP response.response can be plain Markdown, not always JSON-wrapped)
10.2.2026 0.5.7b Fix: Unicode \uXXXX unescape in malformed JSON and nuclear extraction (fixes garbled ä/ö/ü/ß characters)
10.2.2026 0.5.6b Feature: Clickable suggestions in bot responses (list items with ? or quoted text send query on click), malformed JSON extraction fallback
10.2.2026 0.5.5b Fix: _extractOutputFromMalformedJson fallback when JSON.parse fails (lastIndexOf extraction, handles malformed escaping)
10.2.2026 0.5.4b Fix: Strip markdown code block wrapper (```json...```) from PP response string before JSON.parse
10.2.2026 0.5.3b Fix: PP response.response is STRING not object - parse string before traversing, handles all PP envelope formats
10.2.2026 0.5.2b Fix: Direct object traversal for PP response (response.output → JSON.parse → output), recursive fallback for escaped "output" keys
10.2.2026 0.5.1b Fix: Nuclear _extractDeepestOutput scans stringified PP response for all "output" keys, returns longest Markdown value (replaces recursive unwrapping)
10.2.2026 0.5.0b Fix: Stringified JSON output unwrapping, malformed JSON fallback extractor, flat CSS dark mode selectors
10.2.2026 0.4.9b Robust recursive PP response unwrapping (_extractOutputString), dark mode, user text white
10.2.2026 0.4.8b Dark mode support (SAP DM dark theme), fix PP response unwrapping (output.output), user message text white
10.2.2026 0.4.7b Fix: Double-wrapped PP response unwrapping (output.output), user message text color white
10.2.2026 0.4.6b Local test folder (local/), removed _loadSecrets dead code, Prompt v3 (agent input format, Markdown output), builder i18n keys without prefix, local proxy payload matching PP format
10.2.2026 0.4.5-beta Structured JSON response formatter, fenced code block support, improved proxy error handling (502 details), DOM injection for bot messages
09.2.2026 4.4 Markdown-to-HTML rendering, CSS chart support, table rendering, removed structured JSON response format
09.2.2026 4.3 Removed language parameter from PP call (agent detects language from query text)
09.2.2026 4.2 Back to Production Process (CORS fix), keep no-intent architecture, agent URL/API key removed from plugin
09.2.2026 4.1 Fix: builder.properties keys need synKiCopilot. prefix, added builder_en.properties
09.2.2026 4.0 BREAKING: Direct Agent API call (PP removed), intent detection removed, agent fetches SAP DM data autonomously
04.2.2026 3.42 Feature: Debug timing display (request/response/duration) - toggleable in POD Designer
04.2.2026 3.41 Fix: Dialog mode in onAfterRendering (DOM must exist before setDialogMode)
04.2.2026 3.40 Fix: Dialog mode now activated in onBeforeRenderingPlugin where config is available
04.2.2026 3.32 Fix: View's _handleSend now uses _detectIntent instead of hardcoded FREE_QUESTION
04.2.2026 3.31 Version sync: All version numbers aligned to 3.31
04.2.2026 3.17 Frontend: _detectIntent() recognizes SAP terminology questions and sends SAP_TERMINOLOGY intent
03.2.2026 3.16 Prompt: STEP 1 TERMINOLOGY CHECK - explicit pre-check before all intent processing
03.2.2026 3.15 Prompt: Backend terminology detection in FREE_QUESTION - routes to DM Technical Terms agent
03.2.2026 3.14 Fix: Strip markdown code blocks (```json...```) from PP response before JSON parsing
02.2.2026 3.13 Prompt: Multi-Agent Architecture section (ADAM-X orchestrator, SAP Advisor, ADAM, ADAM Think, EVE, ARA, Incidents Bot)
02.2.2026 3.12 Prompt: SAP DM Glossary (SFC, Order, NC, Work Center, Resource, OEE, etc.) for terminology questions via FREE_QUESTION
02.2.2026 3.11 Fix: language parameter added to Production Process call (was missing, causing wrong response language)
02.2.2026 3.10 i18n: Added French (fr) and Spanish (es) translations, supportedLocales in manifest.json
02.2.2026 3.9 Language detection: _getFullLanguageCode maps UI5 locale to full code (en->en-US, de->de-DE), fixes German responses when DM is set to English
02.2.2026 3.8 ORDER_STATUS intent: new Auftrag quick action tag, default query text, mock response, prompt with SAP DM native downtime format
02.2.2026 3.7 FormattedText HTML rendering for bot messages, timestamp formatting, null-label fallback, severity indicators, XSS escaping
02.2.2026 3.6 Robust response handling: PP envelope unwrapping, string response parsing, output type detection, try-catch formatting fallback
29.1.2026 3.5 Safe CommonController improvements: _pluginConfig statt configObject, getEnv() mit LOCAL-Fallback
29.1.2026 3.4 Production Process via doProductionProcessCallPost, registry key from POD Designer
29.1.2026 3.3 Simplified BP params (plant, sfc, wc, res, intent, query), context model + header display
29.1.2026 3.2 POD-Kontext laden (SFC, WorkCenter, Resource), Business Process aus POD Designer Configuration
27.1.2026 3.1 Removed console.log statements for production, using this.logger
27.1.2026 3.0 Backend-Integration mit automatischer Umschaltung Local/Production
27.1.2026 2.1 Switched to view-based methods (addBotMessage, setTyping), mock mode for local
27.1.2026 2.0 Chat UI mit Syntax CI
27.1.2026 1.0 Initial version

*/
sap.ui.define([
    "../../lib/CommonController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "../util/Formatter",
    "../util/ResponseParser",
    "../util/ChartRenderer"
], function(CommonController, JSONModel, MessageBox, MessageToast, Formatter, ResponseParser, ChartRenderer) {
    "use strict";

    // Security & performance constants
    var CONSTANTS = {
        MAX_QUERY_LENGTH: 5000,
        MIN_QUERY_INTERVAL_MS: 2000,
        LOG_PREVIEW_LENGTH: 200,
        SCROLL_DELAY_MS: 200,
        FETCH_TIMEOUT_MS: 120000
    };

    var STORAGE_KEYS = {
        MESSAGES: "synkicopilot_messages",
        HISTORY: "synkicopilot_history"
    };

    return CommonController.extend("syntax.max.ai.synKiCopilot.controller.SynKiCopilot", {

        // ==================== LIFECYCLE ====================

        /**
         * Called on controller initialization.
         */
        onInit: function() {
            try {
                CommonController.prototype.onInit.apply(this, arguments);
            } catch (e) {
                this.logger.error("CommonController.onInit failed: " + e);
            }

            // i18n Bundle - safely get with fallback
            try {
                var oComponent = this.getOwnerComponent();
                if (oComponent && oComponent.getModel("i18n")) {
                    this.oBundle = oComponent.getModel("i18n").getResourceBundle();
                }
            } catch (e) {
                this.logger.warning("Could not get i18n bundle");
            }

            // Chat Model
            this.getView().setModel(new JSONModel({
                messages: [],
                inputValue: "",
                isTyping: false
            }), "chat");

            // View Model
            this.getView().setModel(new JSONModel({
                busy: false
            }), "view");

            // Context Model - POD selection data for UI binding
            this.getView().setModel(new JSONModel({
                plant: "",
                sfc: "",
                workCenter: "",
                resource: ""
            }), "context");

            // Load plugin config
            this._loadConfig();
        },

        /**
         * Loads plugin-specific configuration from config.json.
         * Stored in _pluginConfig to avoid overwriting CommonController's configObject
         * which is used by getPpRegistryValue() and other base methods.
         */
        _loadConfig: function() {
            var that = this;
            var sConfigPath = sap.ui.require.toUrl("syntax/max/ai/synKiCopilot/data/config.json");

            fetch(sConfigPath)
                .then(function(response) {
                    if (response.ok) {
                        return response.json();
                    }
                    throw new Error("Config file not found");
                })
                .then(function(oConfig) {
                    that._pluginConfig = oConfig;
                })
                .catch(function(e) {
                    that.logger.error("Could not load config: " + e.message);
                    that._pluginConfig = {};
                });
        },

        /**
         * Called before plugin rendering (once per instance).
         * Configuration is now available via getConfiguration().
         */
        onBeforeRenderingPlugin: function() {
            this._oConfiguration = this.getConfiguration();

            // Log configuration (mask sensitive fields)
            if (this._oConfiguration) {
                var oLogSafe = Object.assign({}, this._oConfiguration);
                if (oLogSafe.gatewayToken) {
                    oLogSafe.gatewayToken = "***";
                }
                if (oLogSafe.agentApiKey) {
                    oLogSafe.agentApiKey = "***";
                }
                this.logger.info("synKiCopilot config loaded: " + JSON.stringify(oLogSafe));
            }

            // Subscribe to POD events
            this.subscribe("WorklistSelectEvent", this._onWorklistSelect, this);
            this.subscribe("PodSelectionChangeEvent", this._onPodSelectionChange, this);

            // Load initial POD context
            this._updatePodContext();
        },

        /**
         * Called after rendering.
         * Sets up sidebar overlay click-to-close handler, chip click handlers,
         * and restores messages from sessionStorage (DOM must exist).
         */
        onAfterRendering: function() {
            var that = this;

            // Sidebar overlay click-to-close (uses DOM id from html:div in XML view)
            var oOverlayDom = document.getElementById(this.getView().createId("sidebarOverlay"));
            if (!oOverlayDom) {
                // Fallback: try without view prefix
                oOverlayDom = document.getElementById("sidebarOverlay");
            }
            if (oOverlayDom && !this._bOverlayBound) {
                this._bOverlayBound = true;
                oOverlayDom.addEventListener("click", function() {
                    that._closeSidebar();
                });
            }

            // Attach chip click handlers
            if (!this._bChipsBound) {
                this._bChipsBound = true;
                this._attachChipHandlers();
            }

            // Restore messages from sessionStorage (needs DOM)
            if (!this._bMessagesRestored) {
                this._bMessagesRestored = true;
                this._restoreMessages();
            }
        },

        /**
         * Called on view destruction.
         */
        onExit: function() {
            // Unsubscribe events
            this.unsubscribe("WorklistSelectEvent", this._onWorklistSelect, this);
            this.unsubscribe("PodSelectionChangeEvent", this._onPodSelectionChange, this);

            if (CommonController.prototype.onExit) {
                CommonController.prototype.onExit.apply(this, arguments);
            }
        },

        // ==================== POD EVENT HANDLERS ====================

        /**
         * Handler for WorklistSelectEvent.
         * @param {string} sChannelId - Channel ID
         * @param {string} sEventId - Event ID
         * @param {object} oData - Event data
         */
        _onWorklistSelect: function(sChannelId, sEventId, oData) {
            if (this.isEventFiredByThisPlugin(oData)) {
                return;
            }
            this.logger.debug("WorklistSelectEvent received");
            this._updatePodContext();
        },

        /**
         * Handler for PodSelectionChangeEvent.
         * @param {string} sChannelId - Channel ID
         * @param {string} sEventId - Event ID
         * @param {object} oData - Event data
         */
        _onPodSelectionChange: function(sChannelId, sEventId, oData) {
            if (this.isEventFiredByThisPlugin(oData)) {
                return;
            }
            this.logger.debug("PodSelectionChangeEvent received");
            this._updatePodContext();
        },

        /**
         * Updates the context model with current POD selection.
         */
        _updatePodContext: function() {
            var oSelection = {};
            try {
                oSelection = this.getCurrentSelection() || {};
            } catch (e) {
                this.logger.warning("Could not get POD selection: " + e.message);
            }

            // Ensure plant is loaded (may not be available during onInit)
            if (!this.plant || this.plant === "LOCAL") {
                try {
                    var sPodPlant = this.getPodController().getUserPlant();
                    if (sPodPlant) {
                        this.plant = sPodPlant;
                        this.logger.info("Plant loaded from POD context: " + this.plant);
                    }
                } catch (e) {
                    this.logger.debug("Plant not yet available from POD context");
                }
            }

            var oContextData = {
                plant: this.plant || "",
                sfc: oSelection.sfcId || "",
                workCenter: oSelection.workCenterId || "",
                resource: oSelection.resourceId || ""
            };

            var oContextModel = this.getView().getModel("context");
            if (oContextModel) {
                oContextModel.setData(oContextData);
            }

            // Update header context display
            this.updateContextDisplay(oContextData);
        },

        // ==================== XML VIEW EVENT HANDLERS ====================

        /**
         * Menu button press handler (XML view event).
         */
        onMenuPress: function() {
            this._openSidebar();
        },

        /**
         * Close plugin handler - closes the POD popup/dialog.
         */
        onClosePlugin: function() {
            // Find the enclosing sap.m.Dialog by walking up the DOM/control tree
            var oParent = this.getView();
            while (oParent) {
                if (oParent.isA && oParent.isA("sap.m.Dialog")) {
                    oParent.close();
                    return;
                }
                oParent = oParent.getParent ? oParent.getParent() : null;
            }
            // Fallback: find dialog via DOM and close it
            try {
                var oViewDom = this.getView().getDomRef();
                if (oViewDom) {
                    var oDialogDom = oViewDom.closest(".sapMDialog");
                    if (oDialogDom) {
                        var oDialog = sap.ui.getCore().byId(oDialogDom.id);
                        if (oDialog && oDialog.close) {
                            oDialog.close();
                            return;
                        }
                    }
                }
            } catch (e) {
                this.logger.debug("DOM dialog lookup failed: " + e.message);
            }
            this.logger.warning("Could not find dialog to close");
        },

        /**
         * Close sidebar handler (XML view event).
         */
        onCloseSidebar: function() {
            this._closeSidebar();
        },

        /**
         * Toggle history section handler (XML view event).
         */
        onToggleHistory: function() {
            var oHistoryList = this.byId("historyList");
            if (oHistoryList) {
                oHistoryList.setVisible(!oHistoryList.getVisible());
            }
        },

        // ==================== VIEW-LEVEL METHODS (moved from JS View) ====================

        /**
         * Adds a bot message to the chat UI.
         * Called by controller code where previously that.addBotMessage() was used.
         * @param {string} sText - Sanitized HTML string
         */
        addBotMessage: function(sText) {
            this._addMessage("bot", sText);
            this._addMessageToDOM(sText, "bot");
        },

        /**
         * Adds a debug timing message to the chat UI.
         * @param {string} sText - Debug timing text
         */
        addDebugMessage: function(sText) {
            var oMessagesContainer = this.byId("chatMessages");
            if (!oMessagesContainer) { return; }

            var oDebugContent = new sap.m.Text({
                text: sText
            }).addStyleClass("synCopilotDebugText");

            var oDebugMessage = new sap.m.VBox({
                items: [
                    new sap.m.VBox({
                        items: [oDebugContent]
                    }).addStyleClass("synCopilotDebugBubble")
                ]
            }).addStyleClass("synCopilotMessageRow synCopilotDebugMessage");

            oMessagesContainer.addItem(oDebugMessage);
            this._scrollToBottom();
        },

        /**
         * Shows or hides the typing indicator.
         * Called by controller code where previously oView.setTyping() was used.
         * @param {boolean} bTyping - true to show, false to hide
         */
        setTyping: function(bTyping) {
            var oTyping = this.byId("typingIndicator");
            if (oTyping) {
                oTyping.setVisible(bTyping);
            }
            if (bTyping) {
                this._scrollToBottom();
                this._startTypewriter();
            } else {
                this._stopTypewriter();
            }
        },

        // Tech action phrases for typewriter effect (Daft Punk - Technologic)
        _aTechPhrases: [
            "Buy it", "use it", "break it", "fix it",
            "Trash it", "change it", "mail it", "upgrade it",
            "Charge it", "point it", "zoom it", "press it",
            "Snap it", "work it", "quick", "erase it",
            "Write it", "cut it", "paste it", "save it",
            "Load it", "check it", "rewrite it",
            "Plug it", "play it", "burn it", "rip it",
            "Drag it", "drop it", "zip it", "unzip it",
            "Lock it", "fill it", "call it", "find it",
            "View it", "code it", "jam it", "unlock it",
            "Surf it", "scroll it", "pause it", "click it",
            "Cross it", "crack it", "switch it", "update it",
            "Name it", "read it", "tune it", "print it",
            "Scan it", "send it", "fax it", "rename it",
            "Touch it", "bring it", "pay it", "watch it",
            "Turn it", "leave it", "start it", "format it"
        ],

        _startTypewriter: function() {
            var that = this;
            this._typewriterActive = true;
            this._typewriterCharIndex = 0;
            this._currentPhrase = this._aTechPhrases[Math.floor(Math.random() * this._aTechPhrases.length)];

            setTimeout(function() {
                if (!that._typewriterActive) { return; }
                var oTypewriter = document.getElementById("synCopilotTypewriter");
                if (!oTypewriter) { return; }
                oTypewriter.textContent = that._currentPhrase.charAt(0) + "...";

                that._typewriterInterval = setInterval(function() {
                    if (!that._typewriterActive) {
                        clearInterval(that._typewriterInterval);
                        return;
                    }
                    var oEl = document.getElementById("synCopilotTypewriter");
                    if (!oEl) { return; }
                    if (that._typewriterCharIndex < that._currentPhrase.length) {
                        oEl.textContent = that._currentPhrase.substring(0, that._typewriterCharIndex + 1) + "...";
                        that._typewriterCharIndex++;
                    } else {
                        setTimeout(function() {
                            if (that._typewriterActive) {
                                that._currentPhrase = that._aTechPhrases[Math.floor(Math.random() * that._aTechPhrases.length)];
                                that._typewriterCharIndex = 0;
                            }
                        }, 800);
                        that._typewriterCharIndex = that._currentPhrase.length + 1;
                    }
                }, 80);
            }, 150);
        },

        _stopTypewriter: function() {
            this._typewriterActive = false;
            if (this._typewriterInterval) {
                clearInterval(this._typewriterInterval);
                this._typewriterInterval = null;
            }
            var oEl = document.getElementById("synCopilotTypewriter");
            if (oEl) { oEl.textContent = ""; }
        },

        /**
         * Adds a message to the chat DOM (chatMessages VBox).
         * @param {string} sText - Message text (plain for user, sanitized HTML for bot)
         * @param {string} sType - "user" or "bot"
         */
        _addMessageToDOM: function(sText, sType) {
            var oMessagesContainer = this.byId("chatMessages");
            if (!oMessagesContainer) { return; }

            var bIsUser = sType === "user";
            var oBubble = new sap.m.VBox().addStyleClass("synCopilotMessageBubble " + (bIsUser ? "synCopilotMessageUser" : "synCopilotMessageBot"));

            if (bIsUser) {
                oBubble.addItem(new sap.m.Text({ text: sText }).addStyleClass("synCopilotMessageText"));
            } else {
                // Bot messages: content is sanitized by Formatter.sanitizeHtml()
                // before being passed here. DOM injection required for rich HTML.
                var sSafeHtml = Formatter.sanitizeHtml(sText);
                var that = this;
                oBubble.addEventDelegate({
                    onAfterRendering: function() {
                        var oDom = oBubble.getDomRef();
                        if (oDom && !oDom.querySelector(".synCopilotHtmlContent")) {
                            var oDiv = document.createElement("div");
                            oDiv.className = "synCopilotHtmlContent";
                            oDiv.setAttribute("role", "article");
                            // Content has been sanitized by Formatter.sanitizeHtml()
                            oDiv.innerHTML = sSafeHtml; // eslint-disable-line sap-no-inner-html

                            // Attach click handlers to suggestion elements
                            var aSuggestions = oDiv.querySelectorAll(".synCopilotSuggestion");
                            for (var i = 0; i < aSuggestions.length; i++) {
                                (function(oEl) {
                                    oEl.addEventListener("click", function() {
                                        var sQuery = oEl.getAttribute("data-query");
                                        if (sQuery) {
                                            that._addMessageToDOM(sQuery, "user");
                                            that._addMessage("user", sQuery);
                                            that._sendQuery(sQuery);
                                        }
                                    });
                                })(aSuggestions[i]);
                            }

                            oDom.appendChild(oDiv);
                        }
                    }
                });
            }

            var oMessageRow = new sap.m.HBox({
                justifyContent: bIsUser ? sap.m.FlexJustifyContent.End : sap.m.FlexJustifyContent.Start,
                items: [oBubble]
            }).addStyleClass("synCopilotMessageRow");

            oMessagesContainer.addItem(oMessageRow);
            this._scrollToBottom();
        },

        /**
         * Shows the welcome section and suggestion chips.
         * Removes synCopilotChatActive class from root to show welcome via CSS.
         */
        _showWelcome: function() {
            var oRoot = this.byId("chatRootVBox");
            if (oRoot) {
                oRoot.removeStyleClass("synCopilotChatActive");
            }
        },

        /**
         * Hides the welcome section and suggestion chips.
         * Adds synCopilotChatActive class to root to hide welcome via CSS.
         */
        _hideWelcome: function() {
            var oRoot = this.byId("chatRootVBox");
            if (oRoot) {
                oRoot.addStyleClass("synCopilotChatActive");
            }
        },

        /**
         * Attaches click handlers to suggestion chip divs.
         */
        _attachChipHandlers: function() {
            var that = this;

            // Map chip data-chip attribute to i18n query key
            var oChipQueryMap = {
                "nc": "synKiCopilot.query.ncExplain",
                "shift": "synKiCopilot.query.shiftOverview",
                "downtime": "synKiCopilot.query.downtimeEvents",
                "top5": "synKiCopilot.query.topReasons",
                "quality": "synKiCopilot.query.qualityTopics",
                "order": "synKiCopilot.query.orderStatus"
            };

            // Use setTimeout to ensure DOM is ready
            setTimeout(function() {
                var aChips = document.querySelectorAll(".synCopilotChip");
                for (var i = 0; i < aChips.length; i++) {
                    (function(oChipEl) {
                        oChipEl.addEventListener("click", function() {
                            var sChipKey = oChipEl.getAttribute("data-chip");
                            var sQueryKey = oChipQueryMap[sChipKey];
                            if (sQueryKey) {
                                var sQueryText = that._getText(sQueryKey);
                                that._addUserMessage(sQueryText);
                                that._addMessageToDOM(sQueryText, "user");
                                that._hideWelcome();
                                that._sendQuery(sQueryText);
                            }
                        });
                    })(aChips[i]);
                }
            }, 200);
        },

        /**
         * Updates the context display in the header.
         * @param {object} oContext - {plant, sfc, workCenter, resource}
         */
        updateContextDisplay: function(oContext) {
            var aParts = [];
            if (oContext.plant) { aParts.push("PLT: " + oContext.plant); }
            if (oContext.sfc) { aParts.push("SFC: " + oContext.sfc); }
            if (oContext.workCenter) { aParts.push("WC: " + oContext.workCenter); }
            if (oContext.resource) { aParts.push("RES: " + oContext.resource); }

            var oHeader = document.querySelector(".synCopilotHeader");
            if (!oHeader) { return; }

            var oContextEl = document.getElementById("synCopilotHeaderContext");
            if (!oContextEl) {
                oContextEl = document.createElement("span");
                oContextEl.id = "synCopilotHeaderContext";
                oContextEl.style.cssText = "color: rgba(255,255,255,0.7); font-size: 0.75rem; margin-left: 12px;";
                oHeader.appendChild(oContextEl);
            }
            oContextEl.textContent = aParts.length > 0 ? aParts.join(" | ") : "";
        },

        // ==================== CHAT HANDLERS ====================

        /**
         * Quick action tag handler.
         * Tags send a predefined question text to the Agent.
         * @param {string} sQueryText - Default query text for this action
         */
        onQuickAction: function(sQueryText) {
            this._addUserMessage(sQueryText);
            this._addMessageToDOM(sQueryText, "user");
            this._hideWelcome();
            this._sendQuery(sQueryText);
        },

        /**
         * Send message handler.
         * @param {sap.ui.base.Event} oEvent - Event
         */
        onSendMessage: function(oEvent) {
            var oInput = this.byId("chatInput");
            var sMessage = oInput ? oInput.getValue().trim() : "";

            if (!sMessage) {
                return;
            }

            // Input length validation
            if (sMessage.length > CONSTANTS.MAX_QUERY_LENGTH) {
                this.showWarningMessage(this._getText("synKiCopilot.queryTooLong", [CONSTANTS.MAX_QUERY_LENGTH]));
                return;
            }

            // Clear input
            if (oInput) { oInput.setValue(""); }

            // Add user message to model + DOM, hide welcome, send to Agent
            this._addUserMessage(sMessage);
            this._addMessageToDOM(sMessage, "user");
            this._hideWelcome();
            this._sendQuery(sMessage);

            // Return focus to input
            if (oInput) { oInput.focus(); }
        },

        // ==================== CHAT FUNCTIONS ====================

        /**
         * Adds a user message to the chat.
         * @param {string} sText - Message text
         */
        _addUserMessage: function(sText) {
            this._addMessage("user", sText);
        },

        /**
         * Adds a bot message to the chat.
         * @param {string} sText - Message text
         */
        _addBotMessage: function(sText) {
            this._addMessage("bot", sText);
        },

        /**
         * Adds a message to the chat.
         * @param {string} sType - "user" or "bot"
         * @param {string} sText - Message text
         */
        _addMessage: function(sType, sText) {
            var oChatModel = this.getView().getModel("chat");
            var aMessages = oChatModel.getProperty("/messages");

            aMessages.push({
                type: sType,
                text: sText,
                timestamp: this._formatTime(new Date())
            });

            oChatModel.setProperty("/messages", aMessages);

            // Hide welcome section when messages exist
            if (aMessages.length > 0) {
                this._hideWelcome();
            }

            // Persist messages to sessionStorage
            this._saveMessages();

            // Scroll to bottom
            this._scrollToBottom();
        },

        /**
         * Formats time for display.
         * @param {Date} oDate - Date object
         * @returns {string} Formatted time
         */
        _formatTime: function(oDate) {
            var sHours = String(oDate.getHours()).padStart(2, "0");
            var sMinutes = String(oDate.getMinutes()).padStart(2, "0");
            return sHours + ":" + sMinutes;
        },

        /**
         * Scrolls chat to bottom.
         */
        _scrollToBottom: function() {
            var that = this;
            setTimeout(function() {
                requestAnimationFrame(function() {
                    var oContainer = that.byId("chatScrollContainer");
                    if (oContainer) {
                        var oDomRef = oContainer.getDomRef();
                        if (oDomRef) {
                            oDomRef.scrollTop = oDomRef.scrollHeight;
                        }
                    }
                });
            }, CONSTANTS.SCROLL_DELAY_MS);
        },

        // ==================== BACKEND COMMUNICATION ====================

        /**
         * Sends a query to the Agent.
         * Routes based on environment:
         *   LOCAL + mockMode    → mock response
         *   LOCAL + !mockMode   → local proxy (node proxy.js)
         *   DEV/QA/PRD          → Production Process
         * @param {string} sText - User question text
         */
        _sendQuery: function(sText) {
            // Rate limiting - prevent rapid repeated queries
            var nNow = Date.now();
            if (this._lastQueryTime && (nNow - this._lastQueryTime) < CONSTANTS.MIN_QUERY_INTERVAL_MS) {
                this.logger.debug("Query throttled (rate limit)");
                return;
            }
            this._lastQueryTime = nNow;

            // Store request timing for debug display
            this._oRequestTiming = {
                start: new Date()
            };

            // Show typing indicator
            this.setTyping(true);

            // Check if mock mode (config.json LOCAL environment)
            var sEnv = this._detectEnvironment();
            var oConfig = this._getEnvironmentConfig(sEnv);

            if (oConfig.mockMode) {
                this._handleMockResponse();
                return;
            }

            // Local proxy mode (LOCAL environment, no Production Process available)
            if (sEnv === "LOCAL" && !oConfig.useProductionProcess) {
                this._callLocalProxy(sText, oConfig);
                return;
            }

            // Gateway mode (direct API call via Gateway, configured in POD Designer)
            var bUseGateway = this._oConfiguration &&
                (this._oConfiguration.useGateway === true || this._oConfiguration.useGateway === "true");

            if (bUseGateway) {
                this._callGateway(sText);
                return;
            }

            // PP registry key from POD Designer configuration (priority) or config.json (fallback)
            var sRegKey = (this._oConfiguration && this._oConfiguration.productionProcessKey)
                || oConfig.productionProcessKey
                || "";

            if (!sRegKey) {
                this.logger.error("No Production Process key configured");
                this.setTyping(false);
                this.addBotMessage(this._getText("synKiCopilot.noPPKey"));
                return;
            }

            // Call via Production Process (server-side, no CORS)
            this._callProductionProcess(sRegKey, sText);
        },

        /**
         * Detects the current environment.
         * @returns {string} Environment key (LOCAL, DEV, QA, PRD)
         */
        _detectEnvironment: function() {
            var sHostname = window.location.hostname.toLowerCase();

            if (sHostname === "localhost" || sHostname === "127.0.0.1" || sHostname.startsWith("192.168.")) {
                return "LOCAL";
            }

            try {
                var sEnv = this.getEnv();
                if (sEnv) {
                    return sEnv;
                }
            } catch (e) {
                this.logger.warning("getEnv() not available");
            }

            if (sHostname.includes("-dev") || sHostname.includes(".dev.")) {
                return "DEV";
            }
            if (sHostname.includes("-qa") || sHostname.includes(".qa.") || sHostname.includes("-test")) {
                return "QA";
            }

            return "PRD";
        },

        /**
         * Gets configuration for the given environment.
         * @param {string} sEnv - Environment key
         * @returns {object} Environment configuration
         */
        _getEnvironmentConfig: function(sEnv) {
            var oDefaultConfig = {
                useProductionProcess: false,
                productionProcessKey: "",
                mockMode: true
            };

            if (this._pluginConfig && this._pluginConfig[sEnv]) {
                return Object.assign({}, oDefaultConfig, this._pluginConfig[sEnv]);
            }

            return oDefaultConfig;
        },

        /**
         * Calls SAP DM Production Process via CommonController.
         * Uses doProductionProcessCallPost which builds the URL:
         * {peRestDataSourceUri}/api/v1/process/processDefinitions/start?key={regKey}&async=false
         * @param {string} sRegKey - Production Process registry key
         * @param {string} sText - Free text query

         */
        _callProductionProcess: function(sRegKey, sText) {
            var that = this;

            // Get current POD selection
            var oSelection = {};
            try {
                oSelection = this.getCurrentSelection() || {};
            } catch (e) {
                this.logger.warning("Could not get POD selection for PP call: " + e.message);
            }

            // SFC is required by the Production Process
            if (!oSelection.sfcId) {
                this.logger.warning("No SFC selected - cannot call Production Process");
                that.setTyping(false);
                that.addBotMessage(this._getText("synKiCopilot.noSfcSelected"));
                return;
            }

            // Only send minimal params - PP enriches with full DM data
            var oParameters = {
                plant: this.plant || "",
                sfc: oSelection.sfcId || "",
                workCenter: oSelection.workCenterId || "",
                resource: oSelection.resourceId || "",
                query: sText || ""
            };

            this.logger.info("Calling Production Process: " + sRegKey);

            // Use CommonController's doProductionProcessCallPost
            this.doProductionProcessCallPost(
                sRegKey,
                oParameters,
                "copilotResponse",
                function(oController, oResponseData, oErrorDetails, oOriginalParams) {
                    that.setTyping(false);
                    if (oResponseData) {
                        that.logger.info("Production Process response received");
                        that._handleResponse(oResponseData);
                    } else {
                        that.logger.error("PP error: " + JSON.stringify(oErrorDetails));
                        var sUserMessage = that._formatPPError(oErrorDetails);
                        that.addBotMessage(sUserMessage);
                    }
                    that._showDebugTiming();
                }
            );
        },

        /**
         * Calls the Agent via API Gateway (two-step flow).
         * Step 1: POST /gw/data - sends manufacturing context (plant, sfc, workcenter, resource)
         * Step 2: POST /gw/agent - sends only the user question
         * Used when useGateway = true in POD Designer configuration.
         * @param {string} sText - User question text

         */
        _callGateway: function(sText) {
            var that = this;

            var sGatewayUrl = (this._oConfiguration && this._oConfiguration.gatewayUrl) || "";
            var sGatewayToken = (this._oConfiguration && this._oConfiguration.gatewayToken) || "";

            // HTTPS enforcement - prevent credentials over plaintext
            if (sGatewayUrl && !/^https:\/\//i.test(sGatewayUrl)) {
                this.logger.error("Gateway URL must use HTTPS: " + sGatewayUrl);
                that.setTyping(false);
                that.addBotMessage(this._getText("synKiCopilot.gatewayHttpsRequired"));
                return;
            }

            if (!sGatewayUrl) {
                this.logger.error("No Gateway URL configured");
                that.setTyping(false);
                that.addBotMessage(this._getText("synKiCopilot.noGatewayUrl"));
                return;
            }

            if (!sGatewayToken) {
                this.logger.error("No Gateway Token configured");
                that.setTyping(false);
                that.addBotMessage(this._getText("synKiCopilot.noGatewayToken"));
                return;
            }

            // Ensure stable session ID per plugin instance
            if (!this._sGatewaySessionId) {
                this._sGatewaySessionId = "dm-" + Date.now();
            }

            // Get current POD selection
            var oSelection = {};
            try {
                oSelection = this.getCurrentSelection() || {};
            } catch (e) {
                this.logger.warning("Could not get POD selection for Gateway call: " + e.message);
            }

            // Derive base URL (strip trailing /gw/agent or /gw/data if present)
            var sBaseUrl = sGatewayUrl.replace(/\/gw\/(agent|data)\s*$/i, "");

            var oHeaders = {
                "Content-Type": "application/json",
                "x-api-key": sGatewayToken
            };

            // Step 1: Send context to /gw/data (only if SFC changed)
            var sCurrentSfc = oSelection.sfcId || "";
            var bSfcChanged = sCurrentSfc !== (this._sLastSentSfc || "");

            var oContextPromise;

            if (bSfcChanged) {
                var oContextPayload = {
                    context: {
                        plant: this.plant || "",
                        sfc: sCurrentSfc,
                        workcenter: oSelection.workCenterId || "",
                        resource: oSelection.resourceId || ""
                    },
                    session_id: this._sGatewaySessionId
                };

                this.logger.info("SFC changed (" + (this._sLastSentSfc || "-") + " -> " + sCurrentSfc + "), sending context to: " + sBaseUrl + "/gw/data");

                var oTimeoutPromise = new Promise(function(_, reject) {
                    setTimeout(function() { reject(new Error("TIMEOUT")); }, CONSTANTS.FETCH_TIMEOUT_MS);
                });

                oContextPromise = Promise.race([
                    fetch(sBaseUrl + "/gw/data", {
                        method: "POST",
                        headers: oHeaders,
                        body: JSON.stringify(oContextPayload)
                    }),
                    oTimeoutPromise
                ])
                .then(function(response) {
                    if (!response.ok) {
                        that.logger.warning("Context call returned HTTP " + response.status + " - continuing with chat");
                    } else {
                        that._sLastSentSfc = sCurrentSfc;
                    }
                    return response.text();
                });
            } else {
                this.logger.debug("SFC unchanged (" + sCurrentSfc + "), skipping context call");
                oContextPromise = Promise.resolve();
            }

            oContextPromise.then(function() {
                // Step 2: Send chat to /gw/agent (text only, no context fields)
                var oChatPayload = {
                    input: [
                        {
                            type: "text",
                            text: sText || ""
                        }
                    ],
                    session_id: that._sGatewaySessionId
                };

                that.logger.info("Sending chat to Gateway: " + sBaseUrl + "/gw/agent");

                var oChatTimeout = new Promise(function(_, reject) {
                    setTimeout(function() { reject(new Error("TIMEOUT")); }, CONSTANTS.FETCH_TIMEOUT_MS);
                });

                return Promise.race([
                    fetch(sBaseUrl + "/gw/agent", {
                        method: "POST",
                        headers: oHeaders,
                        body: JSON.stringify(oChatPayload)
                    }),
                    oChatTimeout
                ]);
            })
            .then(function(response) {
                var iStatus = response.status;
                return response.text().then(function(sBody) {
                    return { status: iStatus, ok: response.ok, body: sBody };
                });
            })
            .then(function(oResult) {
                that.setTyping(false);

                if (!oResult.ok) {
                    var sErrorMsg = "HTTP " + oResult.status;
                    try {
                        var oErrData = JSON.parse(oResult.body);
                        if (oErrData.detail) {
                            sErrorMsg = oErrData.detail;
                        } else if (oErrData.error && oErrData.error.message) {
                            sErrorMsg = oErrData.error.message;
                        } else if (oErrData.message) {
                            sErrorMsg = oErrData.message;
                        }
                    } catch (e) { /* body not JSON */ }
                    that.logger.error("Gateway error: HTTP " + oResult.status + " - " + sErrorMsg);
                    that.addBotMessage("<strong>Gateway Error:</strong> " + Formatter.escapeHtml(sErrorMsg));
                    that._showDebugTiming();
                    return;
                }

                var oData;
                try {
                    oData = JSON.parse(oResult.body);
                } catch (e) {
                    that.logger.warning("Gateway response is not JSON, treating as direct text");
                    oData = oResult.body;
                }

                that.logger.info("Gateway response received");

                // Pass full response to generic handler (ResponseParser handles all formats)
                that._handleResponse(oData);
                that._showDebugTiming();
            })
            .catch(function(oError) {
                that.setTyping(false);
                var sMsg = oError.message === "TIMEOUT"
                    ? that._getText("synKiCopilot.gatewayTimeout")
                    : oError.message;
                that.logger.error("Gateway error: " + sMsg);
                that.addBotMessage(
                    "<strong>Gateway Error:</strong> " + Formatter.escapeHtml(sMsg)
                );
                that._showDebugTiming();
            });
        },

        /**
         * Calls the local development proxy (node proxy.js).
         * Only used in LOCAL environment when mockMode is false.
         * The proxy forwards requests to the Agent API server-side (no CORS).
         * @param {string} sText - User question text
         * @param {object} oConfig - LOCAL environment config

         */
        _callLocalProxy: function(sText, oConfig) {
            var that = this;
            var sProxyUrl = oConfig.localProxyUrl || "http://localhost:5501/api/query";

            // Build params - proxy fills defaults from secrets.json if empty
            var oParams = {
                plant: this.plant || "",
                sfc: "",
                workCenter: "",
                resource: "",
                query: sText || ""
            };

            // Try to get real POD context (won't work locally, but no harm)
            try {
                var oSelection = this.getCurrentSelection() || {};
                oParams.sfc = oSelection.sfcId || "";
                oParams.workCenter = oSelection.workCenterId || "";
                oParams.resource = oSelection.resourceId || "";
            } catch (e) {
                // Expected locally - POD context not available
            }

            this.logger.info("Calling local proxy: " + sProxyUrl);

            fetch(sProxyUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(oParams)
            })
            .then(function(response) {
                var iStatus = response.status;
                return response.text().then(function(sBody) {
                    return { status: iStatus, ok: response.ok, body: sBody };
                });
            })
            .then(function(oResult) {
                if (!oResult.ok) {
                    // Try to extract error message from proxy response body
                    var sErrorMsg = "HTTP " + oResult.status;
                    try {
                        var oErrData = JSON.parse(oResult.body);
                        if (oErrData.error && oErrData.error.message) {
                            sErrorMsg = oErrData.error.message;
                        }
                    } catch (e) { /* body not JSON, use generic message */ }
                    throw new Error(sErrorMsg);
                }

                var oData;
                try {
                    oData = JSON.parse(oResult.body);
                } catch (e) {
                    that.logger.error("Proxy response is not valid JSON: " + e.message);
                    that.setTyping(false);
                    that.addBotMessage("<p>" + Formatter.escapeHtml(oResult.body.substring(0, 2000)) + "</p>");
                    return;
                }

                that.setTyping(false);
                that.logger.info("Local proxy response received");

                try {
                    that._handleResponse(oData);
                } catch (e) {
                    that.logger.error("_handleResponse error: " + e.message);
                    that.addBotMessage("<p>" + Formatter.escapeHtml(
                        oData && oData.output ? oData.output : oResult.body.substring(0, 2000)
                    ) + "</p>");
                }
                that._showDebugTiming();
            })
            .catch(function(oError) {
                that.logger.error("Local proxy error: " + oError.message);
                that.setTyping(false);
                that.addBotMessage(
                    "<strong>Proxy Error:</strong> " + Formatter.escapeHtml(oError.message) +
                    "<br><br><em>Ist der Proxy gestartet? → node proxy.js</em>"
                );
                that._showDebugTiming();
            });
        },

        /**
         * Formats Production Process error for user-friendly display.
         * Extracts HTTP status code and provides readable message.
         * @param {object} oErrorDetails - Error details from PP callback
         * @returns {string} Formatted error message for chat display
         */
        _formatPPError: function(oErrorDetails) {
            if (!oErrorDetails) {
                return this._getText("synKiCopilot.error");
            }

            var sHttpCode = "";
            var sMessage = "";

            // Check for details array (PP error structure)
            if (oErrorDetails.details && oErrorDetails.details.length > 0) {
                var oDetail = oErrorDetails.details[0];
                if (oDetail.httpResponseCode) {
                    sHttpCode = oDetail.httpResponseCode.replace("HTTP", "");
                }
            }

            if (!sHttpCode && oErrorDetails.code) {
                sHttpCode = oErrorDetails.code;
            }

            // Map HTTP codes to user-friendly messages
            var oHttpMessages = {
                "400": this._getText("synKiCopilot.error.badRequest"),
                "401": this._getText("synKiCopilot.error.unauthorized"),
                "403": this._getText("synKiCopilot.error.forbidden"),
                "404": this._getText("synKiCopilot.error.notFound"),
                "408": this._getText("synKiCopilot.error.timeout"),
                "429": this._getText("synKiCopilot.error.tooManyRequests"),
                "500": this._getText("synKiCopilot.error.serverError"),
                "502": this._getText("synKiCopilot.error.badGateway"),
                "503": this._getText("synKiCopilot.error.serviceUnavailable"),
                "504": this._getText("synKiCopilot.error.gatewayTimeout")
            };

            if (sHttpCode && oHttpMessages[sHttpCode]) {
                sMessage = oHttpMessages[sHttpCode];
            } else if (oErrorDetails.message) {
                sMessage = oErrorDetails.message;
            } else {
                sMessage = this._getText("synKiCopilot.error");
            }

            if (sHttpCode && /^\d{3}$/.test(sHttpCode)) {
                return this._getText("synKiCopilot.error.withCode", [sHttpCode, sMessage]);
            }

            return sMessage;
        },

        /**
         * Handles the backend response.
         * Delegates parsing to ResponseParser, rendering to Formatter/ChartRenderer.
         * @param {object} oResponse - Response object
         */
        _handleResponse: function(oResponse) {
            // Log raw response (debug level for content security)
            var sRaw;
            if (typeof oResponse === "string") {
                sRaw = oResponse;
            } else {
                try { sRaw = JSON.stringify(oResponse); } catch (e) { sRaw = String(oResponse); }
            }
            this.logger.debug("_handleResponse input (" + typeof oResponse + "): " + sRaw.substring(0, 200));

            // Handle error responses
            if (typeof oResponse === "object" && oResponse !== null) {
                if (oResponse.errors && oResponse.errors.length > 0) {
                    this.addBotMessage(Formatter.escapeHtml(oResponse.errors[0].message));
                    return;
                }
                if (oResponse.error) {
                    this.addBotMessage(Formatter.escapeHtml(
                        this._getText("synKiCopilot.genericError", [oResponse.error.message || oResponse.error])
                    ));
                    return;
                }
            }

            // Extract output via ResponseParser (handles all PP/Gateway/string formats)
            var sOutput = ResponseParser.extractOutput(oResponse);

            if (!sOutput) {
                this.addBotMessage(this._getText("synKiCopilot.noResponse"));
                return;
            }

            this.logger.debug("Output to render (" + sOutput.length + " chars): " + sOutput.substring(0, 100));

            try {
                // Check if output contains a ```json code block (agent structured response)
                var oJsonBlock = ResponseParser.extractJsonBlock(sOutput);
                var sHtml;

                if (oJsonBlock.json) {
                    // Agent returned structured JSON - format it nicely
                    sHtml = this._formatStructuredResponse(oJsonBlock.json);
                } else {
                    // Pure Markdown response - convert with chart support
                    var oResult = ChartRenderer.extractChartBlocks(sOutput);
                    sHtml = Formatter.markdownToHtml(oResult.markdown);
                    sHtml = ChartRenderer.insertChartHtml(sHtml, oResult.charts);
                }

                this.logger.debug("HTML generated (" + sHtml.length + " chars)");
                this.addBotMessage(sHtml);
            } catch (e) {
                this.logger.error("Markdown rendering failed: " + e.message);
                // Fallback: show plain text with basic escaping
                this.addBotMessage("<p>" + Formatter.escapeHtml(sOutput) + "</p>");
            }
        },

        // ==================== STRUCTURED RESPONSE ====================

        /**
         * Formats a structured agent JSON response into readable HTML.
         * Handles fields: summary, terminologyExplanation, insights, timeline,
         * topReasons, recommendedNextSteps, disclaimer, errors.
         * @param {object} oData - Parsed JSON from agent response
         * @returns {string} Formatted HTML
         */
        _formatStructuredResponse: function(oData) {
            var aHtml = [];
            var that = this;

            // Summary
            if (oData.summary) {
                aHtml.push("<p><strong>" + Formatter.escapeHtml(oData.summary) + "</strong></p>");
            }

            // Terminology explanation (detailed sections)
            if (oData.terminologyExplanation) {
                var oTerm = oData.terminologyExplanation;
                if (oTerm.term) {
                    aHtml.push("<h3>" + Formatter.escapeHtml(oTerm.term) + "</h3>");
                }
                if (oTerm.simpleExplanation) {
                    aHtml.push("<p>" + Formatter.escapeHtml(oTerm.simpleExplanation) + "</p>");
                }
                if (oTerm.analogy) {
                    aHtml.push("<h4>" + that._getText("synKiCopilot.response.analogy") + "</h4>");
                    aHtml.push("<p>" + Formatter.escapeHtml(oTerm.analogy) + "</p>");
                }
                if (oTerm.practicalUse) {
                    aHtml.push("<h4>" + that._getText("synKiCopilot.response.practicalUse") + "</h4>");
                    aHtml.push("<p>" + Formatter.escapeHtml(oTerm.practicalUse) + "</p>");
                }
                if (oTerm.example) {
                    aHtml.push("<h4>" + that._getText("synKiCopilot.response.example") + "</h4>");
                    aHtml.push("<p>" + Formatter.escapeHtml(oTerm.example) + "</p>");
                }
            }

            // Timeline
            if (oData.timeline && oData.timeline.length > 0) {
                aHtml.push("<h3>" + that._getText("synKiCopilot.response.timeline") + "</h3>");
                aHtml.push("<ul>");
                oData.timeline.forEach(function(oItem) {
                    var sLabel = typeof oItem === "string" ? oItem : (oItem.label || oItem.text || JSON.stringify(oItem));
                    aHtml.push("<li>" + Formatter.escapeHtml(sLabel) + "</li>");
                });
                aHtml.push("</ul>");
            }

            // Insights
            if (oData.insights && oData.insights.length > 0) {
                aHtml.push("<hr>");
                aHtml.push("<ul>");
                oData.insights.forEach(function(sInsight) {
                    aHtml.push("<li>" + Formatter.escapeHtml(sInsight) + "</li>");
                });
                aHtml.push("</ul>");
            }

            // Top reasons
            if (oData.topReasons && oData.topReasons.length > 0) {
                aHtml.push("<h3>" + that._getText("synKiCopilot.response.topReasons") + "</h3>");
                aHtml.push("<ul>");
                oData.topReasons.forEach(function(oItem) {
                    var sLabel = typeof oItem === "string" ? oItem : (oItem.label || oItem.reason || JSON.stringify(oItem));
                    aHtml.push("<li>" + Formatter.escapeHtml(sLabel) + "</li>");
                });
                aHtml.push("</ul>");
            }

            // Recommended next steps
            if (oData.recommendedNextSteps && oData.recommendedNextSteps.length > 0) {
                aHtml.push("<hr>");
                aHtml.push("<h4>" + that._getText("synKiCopilot.response.recommendedSteps") + "</h4>");
                aHtml.push("<ul>");
                oData.recommendedNextSteps.forEach(function(oStep) {
                    var sLabel = typeof oStep === "string" ? oStep : (oStep.label || "");
                    if (sLabel) {
                        aHtml.push("<li>" + Formatter.escapeHtml(sLabel) + "</li>");
                    }
                });
                aHtml.push("</ul>");
            }

            // Errors
            if (oData.errors && oData.errors.length > 0) {
                oData.errors.forEach(function(oErr) {
                    var sMsg = typeof oErr === "string" ? oErr : (oErr.message || JSON.stringify(oErr));
                    aHtml.push("<p><strong>Error:</strong> " + Formatter.escapeHtml(sMsg) + "</p>");
                });
            }

            // Disclaimer
            if (oData.disclaimer) {
                aHtml.push("<hr>");
                aHtml.push("<p><em>" + Formatter.escapeHtml(oData.disclaimer) + "</em></p>");
            }

            // Fallback: if no recognized fields produced output, show summary or raw JSON
            if (aHtml.length === 0) {
                if (oData.output) {
                    return Formatter.markdownToHtml(oData.output);
                }
                aHtml.push("<p>" + Formatter.escapeHtml(JSON.stringify(oData, null, 2)) + "</p>");
            }

            return aHtml.join("");
        },

        /**
         * Handles mock responses for local demo mode.
         * Returns Markdown with a demo chart block.
         */
        _handleMockResponse: function() {
            var that = this;

            // Simulate network delay
            setTimeout(function() {
                that.setTyping(false);

                var sMockMarkdown = "## Mock-Modus \uD83D\uDD27\n\n" +
                    "Der **Production Process** ist nicht konfiguriert.\n\n" +
                    "---\n\n" +
                    "### N\u00e4chste Schritte\n" +
                    "- Production Process Key im POD Designer eintragen\n" +
                    "- Agent im Backend konfigurieren\n" +
                    "- Plugin in SAP DM testen\n\n" +
                    "| Eigenschaft | Wert |\n" +
                    "|---|---|\n" +
                    "| Version | 0.4.5-beta |\n" +
                    "| Modus | Mock |\n" +
                    "| Charts | Ja |\n\n" +
                    "```chart\n" +
                    '{"type":"bar","title":"Demo: Top NC Codes","data":[' +
                    '{"label":"NC-001","value":42},' +
                    '{"label":"NC-002","value":28},' +
                    '{"label":"NC-003","value":15},' +
                    '{"label":"NC-004","value":9},' +
                    '{"label":"NC-005","value":5}]}\n' +
                    "```\n\n" +
                    "*KI-generiert. Ergebnisse pr\u00fcfen.*";

                var oMockResponse = { output: sMockMarkdown };
                that._handleResponse(oMockResponse);
                that._showDebugTiming();
            }, 1500);
        },

        /**
         * Gets the full language code (e.g. "de-DE", "en-US") from the UI5 locale.
         * UI5 getCurrentLanguage() may return short codes like "en" or "de".
         * @returns {string} Full language-region code
         */
        _getFullLanguageCode: function() {
            var sLang = "";
            try {
                if (this.getCurrentLanguage) {
                    sLang = this.getCurrentLanguage();
                }
            } catch (e) {
                // Fallback below
            }

            if (!sLang) {
                return "de-DE";
            }

            // Already a full locale (e.g. "de-DE", "en-US", "en-GB")
            if (sLang.indexOf("-") > -1 || sLang.indexOf("_") > -1) {
                return sLang.replace("_", "-");
            }

            // Map short codes to full locales
            var oMap = {
                "de": "de-DE",
                "en": "en-US",
                "fr": "fr-FR",
                "es": "es-ES",
                "it": "it-IT",
                "pt": "pt-BR",
                "zh": "zh-CN",
                "ja": "ja-JP",
                "ko": "ko-KR"
            };
            return oMap[sLang.toLowerCase()] || sLang + "-" + sLang.toUpperCase();
        },

        /**
         * Generates a UUID for trace ID.
         * @returns {string} UUID
         */
        _generateUUID: function() {
            return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
                var r = Math.random() * 16 | 0;
                var v = c === "x" ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        },

        /**
         * Gets i18n text with fallback.
         * @param {string} sKey - i18n key
         * @param {Array} aParams - Optional parameters for placeholders
         * @returns {string} Translated text or key as fallback
         */
        _getText: function(sKey, aParams) {
            if (this.oBundle) {
                try {
                    return this.oBundle.getText(sKey, aParams);
                } catch (e) {
                    // i18n key not found - use fallback
                }
            }
            // Fallback: return key without prefix or with params
            var sFallback = sKey.replace("synKiCopilot.", "");
            if (aParams && aParams.length > 0) {
                return sFallback + ": " + aParams.join(", ");
            }
            return sFallback;
        },

        /**
         * Shows debug timing information in chat if enabled in POD settings.
         * Displays request time, response time, and duration.
         */
        _showDebugTiming: function() {
            // Check if debug timing is enabled in POD Designer configuration
            var bShowDebugTiming = this._oConfiguration &&
                (this._oConfiguration.showDebugTiming === true ||
                 this._oConfiguration.showDebugTiming === "true");

            if (!bShowDebugTiming || !this._oRequestTiming || !this._oRequestTiming.start) {
                return;
            }

            // Calculate timing
            var oStart = this._oRequestTiming.start;
            var oEnd = new Date();
            var nDurationMs = oEnd.getTime() - oStart.getTime();
            var nDurationSec = (nDurationMs / 1000).toFixed(1);

            // Format times as HH:MM:SS
            var fnFormatTime = function(oDate) {
                return String(oDate.getHours()).padStart(2, "0") + ":" +
                       String(oDate.getMinutes()).padStart(2, "0") + ":" +
                       String(oDate.getSeconds()).padStart(2, "0");
            };

            // Build debug message
            var sDebugMsg = this._getText("synKiCopilot.debug.request") + ": " + fnFormatTime(oStart) + "\n" +
                           this._getText("synKiCopilot.debug.response") + ": " + fnFormatTime(oEnd) + "\n" +
                           this._getText("synKiCopilot.debug.duration") + ": " + nDurationSec + "s";

            // Add as separate bot message with debug styling
            this.addDebugMessage(sDebugMsg);

            // Clear timing data
            this._oRequestTiming = null;
        },

        // ==================== SIDEBAR ====================

        _openSidebar: function() {
            var oSidebar = this.byId("sidebarPanel");
            if (oSidebar) {
                oSidebar.setVisible(true);
                this._renderHistoryList();
            }
            // Show overlay via DOM (html:div element)
            var oOverlayDom = document.getElementById(this.getView().createId("sidebarOverlay"));
            if (oOverlayDom) {
                oOverlayDom.style.display = "block";
            }
        },

        _closeSidebar: function() {
            var oSidebar = this.byId("sidebarPanel");
            if (oSidebar) { oSidebar.setVisible(false); }
            // Hide overlay via DOM (html:div element)
            var oOverlayDom = document.getElementById(this.getView().createId("sidebarOverlay"));
            if (oOverlayDom) { oOverlayDom.style.display = "none"; }
        },

        // ==================== CONVERSATION HISTORY ====================

        _saveMessages: function() {
            var oChatModel = this.getView().getModel("chat");
            var aMessages = oChatModel.getProperty("/messages");
            try {
                sessionStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(aMessages));
            } catch (e) {
                this.logger.warning("Could not save messages: " + e.message);
            }
        },

        _restoreMessages: function() {
            try {
                var sData = sessionStorage.getItem(STORAGE_KEYS.MESSAGES);
                if (!sData) { return; }
                var aMessages = JSON.parse(sData);
                if (!aMessages || aMessages.length === 0) { return; }

                var oChatModel = this.getView().getModel("chat");

                // Set model data first
                oChatModel.setProperty("/messages", aMessages);

                // Replay messages into DOM only (model already set above)
                var that = this;
                setTimeout(function() {
                    aMessages.forEach(function(oMsg) {
                        that._addMessageToDOM(oMsg.text, oMsg.type);
                    });
                    // Hide welcome if messages exist
                    if (aMessages.length > 0) {
                        that._hideWelcome();
                    }
                }, 200);
            } catch (e) {
                this.logger.warning("Could not restore messages: " + e.message);
            }
        },

        _loadHistory: function() {
            try {
                var sData = sessionStorage.getItem(STORAGE_KEYS.HISTORY);
                return sData ? JSON.parse(sData) : [];
            } catch (e) {
                return [];
            }
        },

        _saveHistory: function(aHistory) {
            try {
                sessionStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(aHistory));
            } catch (e) {
                this.logger.warning("Could not save history: " + e.message);
            }
        },

        _saveCurrentToHistory: function() {
            var oChatModel = this.getView().getModel("chat");
            var aMessages = oChatModel.getProperty("/messages");
            if (!aMessages || aMessages.length === 0) {
                return;
            }

            var sFirstUserMsg = "";
            for (var i = 0; i < aMessages.length; i++) {
                if (aMessages[i].type === "user") {
                    sFirstUserMsg = aMessages[i].text;
                    break;
                }
            }

            var oEntry = {
                id: "conv_" + Date.now(),
                title: (sFirstUserMsg || "Conversation").substring(0, 50),
                timestamp: new Date().toISOString(),
                messages: aMessages.slice() // copy
            };

            var aHistory = this._loadHistory();
            aHistory.unshift(oEntry);

            // Keep max 20 entries
            if (aHistory.length > 20) {
                aHistory = aHistory.slice(0, 20);
            }

            this._saveHistory(aHistory);
        },

        onNewConversation: function() {
            // Save current conversation to history (if it has messages)
            this._saveCurrentToHistory();

            // Clear chat model
            var oChatModel = this.getView().getModel("chat");
            oChatModel.setProperty("/messages", []);
            sessionStorage.removeItem(STORAGE_KEYS.MESSAGES);

            // Clear message DOM
            var oMessagesContainer = this.byId("chatMessages");
            if (oMessagesContainer) {
                oMessagesContainer.destroyItems();
            }

            // Show welcome + chips
            this._showWelcome();

            // Reset SFC tracking for gateway mode
            this._sLastSentSfc = "";

            this._closeSidebar();
            this.logger.info("New conversation started");
        },

        _loadConversation: function(sId) {
            var aHistory = this._loadHistory();
            var oEntry = null;
            for (var i = 0; i < aHistory.length; i++) {
                if (aHistory[i].id === sId) {
                    oEntry = aHistory[i];
                    break;
                }
            }
            if (!oEntry) { return; }

            // Clear current
            var oChatModel = this.getView().getModel("chat");
            oChatModel.setProperty("/messages", []);

            var oMessagesContainer = this.byId("chatMessages");
            if (oMessagesContainer) {
                oMessagesContainer.destroyItems();
            }

            // Hide welcome
            this._hideWelcome();

            // Replay messages into DOM only (model set below)
            var that = this;
            oEntry.messages.forEach(function(oMsg) {
                that._addMessageToDOM(oMsg.text, oMsg.type);
            });

            // Update model
            oChatModel.setProperty("/messages", oEntry.messages.slice());
            this._saveMessages();

            this._closeSidebar();
        },

        _deleteHistoryItem: function(sId) {
            var aHistory = this._loadHistory();
            aHistory = aHistory.filter(function(o) { return o.id !== sId; });
            this._saveHistory(aHistory);
            this._renderHistoryList();
        },

        _renderHistoryList: function() {
            var oHistoryVBox = this.byId("historyList");
            var oContainer = oHistoryVBox ? oHistoryVBox.getDomRef() : null;
            if (!oContainer) { return; }

            var aHistory = this._loadHistory();
            var that = this;

            if (aHistory.length === 0) {
                oContainer.textContent = "";
                var oEmpty = document.createElement("div");
                oEmpty.className = "synCopilotHistoryEmpty";
                var oText = document.createElement("span");
                oText.className = "synCopilotHistoryEmptyText";
                oText.textContent = this._getText("synKiCopilot.sidebar.noHistory");
                oEmpty.appendChild(oText);
                oContainer.appendChild(oEmpty);
                return;
            }

            // Build history items using DOM methods for safety
            oContainer.textContent = "";
            aHistory.forEach(function(oEntry) {
                var sDate = "";
                try {
                    var d = new Date(oEntry.timestamp);
                    sDate = String(d.getDate()).padStart(2, "0") + "." +
                            String(d.getMonth() + 1).padStart(2, "0") + ". " +
                            String(d.getHours()).padStart(2, "0") + ":" +
                            String(d.getMinutes()).padStart(2, "0");
                } catch (e) { sDate = ""; }

                var oItem = document.createElement("div");
                oItem.className = "synCopilotHistoryItem";
                oItem.setAttribute("data-id", oEntry.id);

                var oContent = document.createElement("div");
                oContent.className = "synCopilotHistoryItemContent";

                var oTitle = document.createElement("span");
                oTitle.className = "synCopilotHistoryItemTitle";
                oTitle.textContent = oEntry.title;

                var oDate = document.createElement("span");
                oDate.className = "synCopilotHistoryItemDate";
                oDate.textContent = sDate;

                oContent.appendChild(oTitle);
                oContent.appendChild(oDate);

                var oDelete = document.createElement("button");
                oDelete.className = "synCopilotHistoryItemDelete";
                oDelete.setAttribute("data-id", oEntry.id);
                oDelete.textContent = "\u00D7";
                oDelete.title = "Delete";

                oItem.appendChild(oContent);
                oItem.appendChild(oDelete);

                // Click handlers
                oItem.addEventListener("click", function(e) {
                    if (e.target === oDelete || e.target.classList.contains("synCopilotHistoryItemDelete")) {
                        e.stopPropagation();
                        that._deleteHistoryItem(oEntry.id);
                        return;
                    }
                    that._loadConversation(oEntry.id);
                });

                oContainer.appendChild(oItem);
            });
        }
    });
});
