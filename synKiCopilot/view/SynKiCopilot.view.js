/* SAP AI Chat View
   Version: 0.9.0 - Joule-style purple gradient UI with sidebar, welcome screen, suggestion chips
*/
sap.ui.define([
    "sap/ui/core/HTML",
    "sap/m/HBox",
    "sap/m/VBox",
    "sap/m/Button",
    "sap/m/Input",
    "sap/m/Text",
    "sap/m/ScrollContainer",
    "sap/m/FlexItemData",
    "sap/m/library",
    "../util/Formatter"
], function(HTML, HBox, VBox, Button, Input, Text, ScrollContainer, FlexItemData, mLibrary, Formatter) {
    "use strict";

    // Get enums from library (not deprecated)
    var FlexAlignItems = mLibrary.FlexAlignItems;
    var FlexJustifyContent = mLibrary.FlexJustifyContent;
    var ButtonType = mLibrary.ButtonType;

    // Plugin version - displayed in header
    var PLUGIN_VERSION = "0.9.0";

    // SVG Sparkle icon (Joule diamond with sparkles) - static trusted content
    var SPARKLE_SVG = '<svg width="120" height="120" viewBox="0 0 122 120" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<path fill-rule="evenodd" clip-rule="evenodd" d="M46.6026 37C45.3357 37 44.1364 37.5715 43.3379 38.5556L24.9405 61.23C23.7324 62.7189 23.6834 64.8368 24.8211 66.3802L61.616 116.29C62.4087 117.365 63.6647 118 65 118C66.3353 118 67.5913 117.365 68.384 116.29L105.179 66.3802C106.317 64.8368 106.268 62.7189 105.06 61.23L86.6621 38.5556C85.8636 37.5715 84.6643 37 83.3974 37H46.6026ZM88.3249 63.5392C79.643 62.0748 76.8647 55.2489 75.9469 50.9797C75.8477 50.5577 75.302 50.5825 75.2276 51.0045C73.764 59.6919 66.9425 62.4719 62.6759 63.3903C62.2543 63.4896 62.2791 64.0357 62.7008 64.1101C71.3827 65.5746 74.1609 72.4004 75.0787 76.6697C75.178 77.0917 75.7237 77.0668 75.7981 76.6449C77.2616 67.9574 84.0832 65.1774 88.3497 64.259C88.7714 64.1598 88.7466 63.6137 88.3249 63.5392Z" fill="#ffffff"/>' +
        '<path d="M101.542 20.3013C102.16 23.126 104.031 27.6422 109.878 28.6111C110.162 28.6604 110.179 29.0217 109.895 29.0874C107.022 29.695 102.428 31.5343 101.442 37.2822C101.392 37.5614 101.024 37.5778 100.958 37.2986C100.34 34.4739 98.4685 29.9578 92.6215 28.9888C92.3375 28.9396 92.3208 28.5783 92.6048 28.5126C95.4782 27.9049 100.072 26.0656 101.058 20.3178C101.108 20.0386 101.476 20.0222 101.542 20.3013Z" fill="#ffffff"/>' +
        '<path d="M42.2811 0.302036C43.1925 4.53904 45.9515 11.3133 54.5733 12.7667C54.9921 12.8406 55.0167 13.3826 54.598 13.4811C50.361 14.3925 43.5867 17.1515 42.1333 25.7733C42.0594 26.1921 41.5174 26.2167 41.4189 25.798C40.5075 21.561 37.7485 14.7867 29.1267 13.3333C28.7079 13.2594 28.6833 12.7174 29.102 12.6189C33.339 11.7075 40.1133 8.94848 41.5667 0.326668C41.6406 -0.0921059 42.1826 -0.116738 42.2811 0.302036Z" fill="#ffffff"/>' +
        '<path d="M16.7874 26.3048C17.395 29.1782 19.2344 33.7722 24.9822 34.7579C25.2614 34.808 25.2778 35.1755 24.9986 35.2423C22.174 35.8604 17.6578 37.7315 16.6889 43.5784C16.6396 43.8624 16.2783 43.8791 16.2126 43.5951C15.605 40.7218 13.7657 36.1277 8.01778 35.1421C7.7386 35.092 7.72218 34.7244 8.00136 34.6576C10.826 34.0395 15.3422 32.1685 16.3111 26.3215C16.3604 26.0375 16.7217 26.0208 16.7874 26.3048Z" fill="#ffffff"/>' +
        '</svg>';

    // Note: sap.ui.jsview is deprecated but required for POD plugins with synchronous
    // view creation. Modern alternatives require async patterns incompatible with
    // ProductionUIComponent.createContent()
    sap.ui.jsview("syntax.max.ai.synKiCopilot.view.SynKiCopilot", {

        getControllerName: function() {
            return "syntax.max.ai.synKiCopilot.controller.SynKiCopilot";
        },

        createContent: function(oController) {
            var that = this;

            // Store controller reference
            this._oController = oController;

            // Get i18n bundle
            this._oBundle = this._getResourceBundle();

            // Build the Joule-style layout
            return this._createMainLayout(oController);
        },

        // ==================== LAYOUT ====================

        /**
         * Creates the main layout with sidebar, overlay, and chat area.
         * Uses sap.ui.core.HTML for the outer shell (position:relative container,
         * sidebar, overlay) and places UI5 controls into it after rendering.
         * @param {object} oController - Controller reference
         * @returns {sap.ui.core.HTML} Root HTML container
         */
        _createMainLayout: function(oController) {
            var that = this;

            // Root HTML container (position: relative for absolute sidebar)
            var oRootHtml = new HTML({
                content: '<div id="synCopilotMainContainer" class="synCopilotMainContainer">' +
                    // Sidebar (hidden initially)
                    '<div id="synCopilotSidebar" class="synCopilotSidebar" style="display:none">' +
                        '<div id="synCopilotSidebarHeader" class="synCopilotSidebarHeader"></div>' +
                        '<div id="synCopilotSidebarNewConv" class="synCopilotSidebarNewConv"></div>' +
                        '<div id="synCopilotSidebarHistorySection" class="synCopilotSidebarHistorySection">' +
                            '<div id="synCopilotHistoryHeader" class="synCopilotHistoryHeader"></div>' +
                            '<div id="synCopilotHistoryList" class="synCopilotHistoryList"></div>' +
                        '</div>' +
                    '</div>' +
                    // Sidebar overlay (hidden initially)
                    '<div id="synCopilotSidebarOverlay" class="synCopilotSidebarOverlay" style="display:none"></div>' +
                    // Chat root placeholder
                    '<div id="synCopilotChatRoot"></div>' +
                '</div>',
                afterRendering: function() {
                    that._initializeLayout(oController);
                }
            });

            return oRootHtml;
        },

        /**
         * Initializes all UI5 controls into the rendered HTML placeholders.
         * @param {object} oController - Controller reference
         */
        _initializeLayout: function(oController) {
            var that = this;

            // Prevent double initialization
            if (this._bLayoutInitialized) {
                return;
            }
            this._bLayoutInitialized = true;

            // -- Sidebar controls --
            this._initializeSidebar(oController);

            // -- Overlay click handler --
            var oOverlay = document.getElementById("synCopilotSidebarOverlay");
            if (oOverlay) {
                oOverlay.addEventListener("click", function() {
                    if (oController._closeSidebar) {
                        oController._closeSidebar();
                    }
                });
            }

            // -- Chat root (VBox with flex:1) --
            var oChatRoot = this._createChatRoot(oController);
            var oChatRootContainer = document.getElementById("synCopilotChatRoot");
            if (oChatRootContainer) {
                oChatRoot.placeAt(oChatRootContainer);
            }
        },

        /**
         * Initializes sidebar header, new conversation button, and history header.
         * @param {object} oController - Controller reference
         */
        _initializeSidebar: function(oController) {
            // Sidebar header: hamburger + title + close button
            var oSidebarHeaderContainer = document.getElementById("synCopilotSidebarHeader");
            if (oSidebarHeaderContainer) {
                var oSidebarHeader = new HBox({
                    alignItems: FlexAlignItems.Center,
                    justifyContent: FlexJustifyContent.SpaceBetween,
                    items: [
                        new HBox({
                            alignItems: FlexAlignItems.Center,
                            items: [
                                new Button({
                                    icon: "sap-icon://menu2",
                                    type: ButtonType.Transparent,
                                    press: function() {
                                        if (oController._closeSidebar) {
                                            oController._closeSidebar();
                                        }
                                    }
                                }).addStyleClass("synCopilotSidebarMenuBtn"),
                                new Text({ text: this._getText("synKiCopilot.title") }).addStyleClass("synCopilotSidebarTitle")
                            ]
                        }),
                        new Button({
                            icon: "sap-icon://decline",
                            type: ButtonType.Transparent,
                            press: function() {
                                if (oController._closeSidebar) {
                                    oController._closeSidebar();
                                }
                            }
                        }).addStyleClass("synCopilotSidebarCloseBtn")
                    ]
                });
                oSidebarHeader.placeAt(oSidebarHeaderContainer);
            }

            // New Conversation button
            var oNewConvContainer = document.getElementById("synCopilotSidebarNewConv");
            if (oNewConvContainer) {
                var oNewConvBox = new HBox({
                    items: [
                        new Button({
                            text: "Neues Gespr\u00e4ch",
                            icon: "sap-icon://add",
                            type: ButtonType.Transparent,
                            press: function() {
                                if (oController.onNewConversation) {
                                    oController.onNewConversation();
                                }
                            }
                        }).addStyleClass("synCopilotNewConvBtn")
                    ]
                });
                oNewConvBox.placeAt(oNewConvContainer);
            }

            // History header: "Verlauf" label + toggle
            var oHistoryHeaderContainer = document.getElementById("synCopilotHistoryHeader");
            if (oHistoryHeaderContainer) {
                var oHistoryHeader = new HBox({
                    alignItems: FlexAlignItems.Center,
                    justifyContent: FlexJustifyContent.SpaceBetween,
                    items: [
                        new Text({ text: "Verlauf" }).addStyleClass("synCopilotHistoryTitle"),
                        new Button({
                            id: this.createId("historyToggleBtn"),
                            icon: "sap-icon://navigation-down-arrow",
                            type: ButtonType.Transparent,
                            press: function() {
                                if (oController.onToggleHistory) {
                                    oController.onToggleHistory();
                                }
                            }
                        }).addStyleClass("synCopilotHistoryToggleBtn")
                    ]
                });
                oHistoryHeader.placeAt(oHistoryHeaderContainer);
            }
        },

        /**
         * Creates the main chat root VBox containing header, welcome, chips, messages, input.
         * @param {object} oController - Controller reference
         * @returns {sap.m.VBox} Chat root VBox
         */
        _createChatRoot: function(oController) {
            var that = this;
            var oView = this;

            // -- Header bar (purple gradient) --
            var oHeader = new HBox({
                alignItems: FlexAlignItems.Center,
                items: [
                    new Button({
                        icon: "sap-icon://menu2",
                        type: ButtonType.Transparent,
                        press: function() {
                            if (oController._openSidebar) {
                                oController._openSidebar();
                            }
                        }
                    }).addStyleClass("synCopilotMenuBtn"),
                    new Text({
                        text: this._getText("synKiCopilot.title") + " v" + PLUGIN_VERSION
                    }).addStyleClass("synCopilotHeaderTitle")
                ]
            }).addStyleClass("synCopilotHeader");

            // -- Welcome section (purple gradient with sparkle SVG) --
            // Uses sap.ui.core.HTML for the complex gradient layout with SVG
            var oWelcomeHtml = new HTML({
                content: '<div id="synCopilotWelcome" class="synCopilotWelcomeSection">' +
                    '<div class="synCopilotSparkleArea" style="display:flex;justify-content:center;align-items:center;">' +
                        '<div class="synCopilotJouleIcon">' + SPARKLE_SVG + '</div>' +
                    '</div>' +
                    '<div class="synCopilotGreeting">' +
                        '<div class="synCopilotGreetingName">Hallo,</div>' +
                        '<div class="synCopilotGreetingQuestion">Wie kann ich Ihnen helfen?</div>' +
                    '</div>' +
                    '<div class="synCopilotHintCardWrapper" style="display:flex;justify-content:center;">' +
                        '<div class="synCopilotHintCard">Sprechen Sie einfach mit mir.</div>' +
                    '</div>' +
                '</div>'
            });

            // -- Suggestion chips (rendered as HTML divs with click handlers) --
            var oChipsHtml = new HTML({
                content: '<div id="synCopilotChips" class="synCopilotSuggestions">' +
                    '<div class="synCopilotChip" data-chip="nc">' + this._getText("synKiCopilot.tag.nc") + '</div>' +
                    '<div class="synCopilotChip" data-chip="shift">' + this._getText("synKiCopilot.tag.shift") + '</div>' +
                    '<div class="synCopilotChip" data-chip="downtime">' + this._getText("synKiCopilot.tag.downtime") + '</div>' +
                    '<div class="synCopilotChip" data-chip="top5">' + this._getText("synKiCopilot.tag.top5") + '</div>' +
                    '<div class="synCopilotChip" data-chip="quality">' + this._getText("synKiCopilot.tag.quality") + '</div>' +
                    '<div class="synCopilotChip" data-chip="order">' + this._getText("synKiCopilot.tag.order") + '</div>' +
                '</div>',
                afterRendering: function() {
                    that._attachChipHandlers(oController);
                }
            });

            // -- Messages container (VBox accessible via byId) --
            var oMessages = new VBox({
                id: oView.createId("messagesContainer")
            }).addStyleClass("synCopilotMessages");

            // -- Typing indicator (hidden initially) --
            var oTyping = new HBox({
                id: oView.createId("typingIndicator"),
                visible: false,
                items: [
                    new HTML({
                        content: '<div class="synCopilotTypingBubble">' +
                                     '<div class="synCopilotSpinner"></div>' +
                                     '<span class="synCopilotTypingText" id="synCopilotTypewriter"></span>' +
                                 '</div>'
                    })
                ]
            }).addStyleClass("synCopilotMessageRow synCopilotMessageBot synCopilotTypingRow");

            // -- Content area inside scroll container --
            var oContentArea = new VBox({
                items: [oMessages, oTyping]
            }).addStyleClass("synCopilotContentArea");

            // -- Scroll container --
            var oScrollContainer = new ScrollContainer({
                id: oView.createId("chatScrollContainer"),
                height: "100%",
                width: "100%",
                vertical: true,
                content: [oContentArea]
            }).addStyleClass("synCopilotContentScroll");

            // -- Input section (positioned absolute at bottom via CSS) --
            var oInput = new Input({
                id: oView.createId("chatInput"),
                placeholder: this._getText("synKiCopilot.inputPlaceholder"),
                submit: function() {
                    that._handleSend(oController);
                },
                layoutData: new FlexItemData({ growFactor: 1 })
            }).addStyleClass("synCopilotInput");

            // ARIA: set accessible label on the input DOM after rendering
            oInput.addEventDelegate({
                onAfterRendering: function() {
                    var oInputDom = oInput.$("inner");
                    if (oInputDom.length) {
                        oInputDom.attr("aria-label", that._getText("synKiCopilot.chatInput"));
                    }
                }
            });

            // Store input reference
            this._oInput = oInput;

            var oSendBtn = new Button({
                icon: "sap-icon://paper-plane",
                type: ButtonType.Transparent,
                tooltip: this._getText("synKiCopilot.sendMessage"),
                press: function() {
                    that._handleSend(oController);
                }
            }).addStyleClass("synCopilotSendBtn");

            var oInputRow = new HBox({
                alignItems: FlexAlignItems.Center,
                items: [oInput, oSendBtn]
            }).addStyleClass("synCopilotInputRow");

            var oDisclaimer = new Text({
                text: this._getText("synKiCopilot.disclaimer")
            }).addStyleClass("synCopilotDisclaimer");

            var oInputSection = new VBox({
                items: [oInputRow, oDisclaimer]
            }).addStyleClass("synCopilotInputSection");

            // -- Chat view container (flex:1, holds welcome + chips + scroll + input) --
            var oChatViewContainer = new VBox({
                id: oView.createId("chatViewContainer"),
                items: [oWelcomeHtml, oChipsHtml, oScrollContainer, oInputSection]
            }).addStyleClass("synCopilotChatContainer");

            // -- Chat root VBox --
            var oChatRoot = new VBox({
                items: [oHeader, oChatViewContainer]
            }).addStyleClass("synCopilotRoot");

            return oChatRoot;
        },

        // ==================== CHIP HANDLERS ====================

        /**
         * Attaches click handlers to suggestion chip divs.
         * Maps each chip's data-chip attribute to its i18n query key.
         * @param {object} oController - Controller reference
         */
        _attachChipHandlers: function(oController) {
            var that = this;
            var oChipsContainer = document.getElementById("synCopilotChips");
            if (!oChipsContainer) {
                return;
            }

            // Map chip data-chip attribute to i18n query key
            var oChipQueryMap = {
                "nc": "synKiCopilot.query.ncExplain",
                "shift": "synKiCopilot.query.shiftOverview",
                "downtime": "synKiCopilot.query.downtimeEvents",
                "top5": "synKiCopilot.query.topReasons",
                "quality": "synKiCopilot.query.qualityTopics",
                "order": "synKiCopilot.query.orderStatus"
            };

            var aChips = oChipsContainer.querySelectorAll(".synCopilotChip");
            for (var i = 0; i < aChips.length; i++) {
                (function(oChipEl) {
                    oChipEl.addEventListener("click", function() {
                        var sChipKey = oChipEl.getAttribute("data-chip");
                        var sQueryKey = oChipQueryMap[sChipKey];
                        if (sQueryKey) {
                            var sQueryText = that._getText(sQueryKey);
                            // Add user message, hide welcome + chips, send query
                            that._addMessage(sQueryText, "user", oController);
                            that._hideWelcome();
                            oController._sendQuery(sQueryText);
                        }
                    });
                })(aChips[i]);
            }
        },

        // ==================== WELCOME SHOW/HIDE ====================

        /**
         * Shows the welcome section and suggestion chips.
         * Called when starting a new conversation.
         */
        _showWelcome: function() {
            var oWelcome = document.getElementById("synCopilotWelcome");
            var oChips = document.getElementById("synCopilotChips");
            if (oWelcome) {
                oWelcome.style.display = "";
            }
            if (oChips) {
                oChips.style.display = "";
            }
            // Remove chat active class from root
            var oRoot = document.querySelector(".synCopilotRoot");
            if (oRoot) {
                oRoot.classList.remove("synCopilotChatActive");
            }
        },

        /**
         * Hides the welcome section and suggestion chips.
         * Called when the first message is sent.
         */
        _hideWelcome: function() {
            // Add chat active class to root (CSS hides welcome + chips)
            var oRoot = document.querySelector(".synCopilotRoot");
            if (oRoot) {
                oRoot.classList.add("synCopilotChatActive");
            }
        },

        // ==================== INPUT HANDLING ====================

        _handleSend: function(oController) {
            var sMessage = this._oInput.getValue().trim();
            if (!sMessage) {
                return;
            }

            this._oInput.setValue("");
            this._addMessage(sMessage, "user", oController);
            this._hideWelcome();
            oController._sendQuery(sMessage);

            // Return focus to input for accessibility
            this._oInput.focus();
        },

        // ==================== MESSAGE MANAGEMENT ====================

        /**
         * Adds a message to the chat.
         * @param {string} sText - Message text (plain for user, sanitized HTML for bot)
         * @param {string} sType - "user" or "bot"
         * @param {object} oController - Controller reference
         */
        _addMessage: function(sText, sType, oController) {
            var oMessagesContainer = this.byId("messagesContainer");

            if (oMessagesContainer) {
                var bIsUser = sType === "user";
                var sTime = oController._formatTime(new Date());

                // Build message bubble
                var oBubble = new VBox().addStyleClass("synCopilotMessageBubble " + (bIsUser ? "synCopilotMessageUser" : "synCopilotMessageBot"));

                if (bIsUser) {
                    oBubble.addItem(new Text({ text: sText }).addStyleClass("synCopilotMessageText"));
                } else {
                    // Bot messages: content is already sanitized by Formatter.sanitizeHtml()
                    // in the controller before being passed here. Direct DOM injection is
                    // required because sap.ui.core.HTML silently fails for some content.
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
                                            if (sQuery && oController) {
                                                that._addMessage(sQuery, "user", oController);
                                                oController._sendQuery(sQuery);
                                            }
                                        });
                                    })(aSuggestions[i]);
                                }

                                oDom.appendChild(oDiv);
                            }
                        }
                    });
                }

                var oMessageRow = new HBox({
                    justifyContent: bIsUser ? FlexJustifyContent.End : FlexJustifyContent.Start,
                    items: [oBubble]
                }).addStyleClass("synCopilotMessageRow");

                oMessagesContainer.addItem(oMessageRow);
                this._scrollToBottom();
            }
        },

        /**
         * Adds a bot message to the chat. Public API called by controller.
         * @param {string} sText - Sanitized HTML string
         */
        addBotMessage: function(sText) {
            this._addMessage(sText, "bot", this._oController);
        },

        /**
         * Adds a debug timing message to the chat.
         * Displayed in a smaller, muted style to distinguish from regular messages.
         * @param {string} sText - Debug timing text
         */
        addDebugMessage: function(sText) {
            var oMessagesContainer = this.byId("messagesContainer");

            if (oMessagesContainer) {
                var oDebugContent = new Text({
                    text: sText
                }).addStyleClass("synCopilotDebugText");

                var oDebugMessage = new VBox({
                    items: [
                        new VBox({
                            items: [oDebugContent]
                        }).addStyleClass("synCopilotDebugBubble")
                    ]
                }).addStyleClass("synCopilotMessageRow synCopilotDebugMessage");

                oMessagesContainer.addItem(oDebugMessage);
                this._scrollToBottom();
            }
        },

        // ==================== TYPING INDICATOR ====================

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

        /**
         * Shows or hides the typing indicator. Public API called by controller.
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

        _startTypewriter: function() {
            var that = this;
            this._typewriterActive = true;
            this._typewriterCharIndex = 0;
            this._currentPhrase = this._getRandomPhrase();

            // Wait for DOM to be ready
            setTimeout(function() {
                if (!that._typewriterActive) {
                    return;
                }

                var oTypewriter = document.getElementById("synCopilotTypewriter");
                if (!oTypewriter) {
                    return;
                }

                oTypewriter.textContent = that._currentPhrase.charAt(0) + "...";

                that._typewriterInterval = setInterval(function() {
                    if (!that._typewriterActive) {
                        clearInterval(that._typewriterInterval);
                        return;
                    }

                    var oEl = document.getElementById("synCopilotTypewriter");
                    if (!oEl) {
                        return;
                    }

                    // Type current phrase
                    if (that._typewriterCharIndex < that._currentPhrase.length) {
                        oEl.textContent = that._currentPhrase.substring(0, that._typewriterCharIndex + 1) + "...";
                        that._typewriterCharIndex++;
                    } else {
                        // Wait a moment then start new phrase
                        setTimeout(function() {
                            if (that._typewriterActive) {
                                that._currentPhrase = that._getRandomPhrase();
                                that._typewriterCharIndex = 0;
                            }
                        }, 800);
                        that._typewriterCharIndex = that._currentPhrase.length + 1; // Prevent re-triggering
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
            if (oEl) {
                oEl.textContent = "";
            }
        },

        _getRandomPhrase: function() {
            var iIndex = Math.floor(Math.random() * this._aTechPhrases.length);
            return this._aTechPhrases[iIndex];
        },

        // ==================== CONTEXT DISPLAY ====================

        /**
         * Updates the context display in the header with POD selection data.
         * Shows plant, SFC, work center, and resource as a compact string.
         * @param {object} oContext - {plant, sfc, workCenter, resource}
         */
        updateContextDisplay: function(oContext) {
            var aParts = [];
            if (oContext.plant) {
                aParts.push("PLT: " + oContext.plant);
            }
            if (oContext.sfc) {
                aParts.push("SFC: " + oContext.sfc);
            }
            if (oContext.workCenter) {
                aParts.push("WC: " + oContext.workCenter);
            }
            if (oContext.resource) {
                aParts.push("RES: " + oContext.resource);
            }

            // Update or create context element in header
            var oHeader = document.querySelector(".synCopilotHeader");
            if (!oHeader) {
                return;
            }

            var oContextEl = document.getElementById("synCopilotHeaderContext");
            if (!oContextEl) {
                oContextEl = document.createElement("span");
                oContextEl.id = "synCopilotHeaderContext";
                oContextEl.style.cssText = "color: rgba(255,255,255,0.7); font-size: 0.75rem; margin-left: 12px;";
                oHeader.appendChild(oContextEl);
            }

            oContextEl.textContent = aParts.length > 0 ? aParts.join(" | ") : "";
        },

        // ==================== SCROLL ====================

        _scrollToBottom: function() {
            var that = this;
            setTimeout(function() {
                var oScrollContainer = that.byId("chatScrollContainer");
                if (oScrollContainer) {
                    var oDom = oScrollContainer.getDomRef();
                    if (oDom) {
                        oDom.scrollTop = oDom.scrollHeight;
                    }
                }
            }, 100);
        },

        // ==================== I18N ====================

        /**
         * Gets the i18n ResourceBundle.
         * @returns {sap.base.i18n.ResourceBundle} ResourceBundle or null
         */
        _getResourceBundle: function() {
            try {
                var oComponent = sap.ui.getCore().getComponent(
                    this.getId().split("---")[0]
                );
                if (oComponent && oComponent.getModel("i18n")) {
                    return oComponent.getModel("i18n").getResourceBundle();
                }
            } catch (e) {
                // Fallback - bundle not available
            }
            return null;
        },

        /**
         * Gets i18n text with fallback.
         * Always fetches current bundle to support language changes.
         * @param {string} sKey - i18n key
         * @param {Array} aParams - Optional parameters
         * @returns {string} Translated text or fallback
         */
        _getText: function(sKey, aParams) {
            // Always get current bundle (don't use cached version)
            var oBundle = this._getResourceBundle();
            if (oBundle) {
                try {
                    return oBundle.getText(sKey, aParams);
                } catch (e) {
                    // Fallback below
                }
            }
            // Fallback texts (German - matches fallbackLocale in manifest.json)
            var oFallbacks = {
                "synKiCopilot.title": "SAP AI Chat",
                "synKiCopilot.subtitle": "Erkl\u00e4rt, was passiert ist.",
                "synKiCopilot.disclaimer": "KI-generiert. Ergebnisse pr\u00fcfen.",
                "synKiCopilot.welcome.title": "Willkommen beim SAP AI Chat",
                "synKiCopilot.welcome.text": "W\u00e4hlen Sie eine Aktion oder stellen Sie eine Frage.",
                "synKiCopilot.inputPlaceholder": "Stelle eine Frage zum aktuellen Kontext...",
                "synKiCopilot.tag.nc": "NC",
                "synKiCopilot.tag.shift": "Schicht",
                "synKiCopilot.tag.downtime": "Ausfall",
                "synKiCopilot.tag.top5": "Top 5",
                "synKiCopilot.tag.quality": "Qualit\u00e4t",
                "synKiCopilot.tag.order": "Auftrag",
                "synKiCopilot.query.ncExplain": "Erkl\u00e4re den aktuellen NC-Code",
                "synKiCopilot.query.shiftOverview": "Was ist in der letzten Schicht passiert?",
                "synKiCopilot.query.downtimeEvents": "Welche Stillst\u00e4nde gab es zuletzt?",
                "synKiCopilot.query.topReasons": "Was sind die h\u00e4ufigsten Stillstandsgr\u00fcnde?",
                "synKiCopilot.query.qualityTopics": "Welche Qualit\u00e4tsthemen sind offen?",
                "synKiCopilot.query.orderStatus": "Wie ist der aktuelle Auftragsstatus?",
                "synKiCopilot.sendMessage": "Nachricht senden",
                "synKiCopilot.chatInput": "Chat-Eingabe"
            };
            return oFallbacks[sKey] || sKey;
        }
    });
});
