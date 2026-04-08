/* CommonController.js
Base Controller für SAP DM POD Plugins
Version: 1.0

WICHTIG: Diese Datei NICHT ändern!
Sie wird von allen Plugins gemeinsam genutzt.
*/
sap.ui.define([
    "sap/dm/dme/podfoundation/controller/PluginViewController",
    "sap/ui/core/BusyIndicator",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/base/i18n/Localization"
], function(PluginViewController, BusyIndicator, JSONModel, MessageBox, MessageToast, Localization) {
    "use strict";

    return PluginViewController.extend("sap.dm.dme.podfoundation.controller.CommonController", {

        // ==================== CONSTANTS ====================
        
        DEPLOY_PATH: "",
        DEPLOY_VERSION: "",

        SFC_STATE_NEW: "401",
        SFC_STATE_INQUEUE: "402",
        SFC_STATE_ACTIVE: "403",
        SFC_STATE_HOLD: "404",
        SFC_STATE_DONE: "405",

        // ==================== LIFECYCLE ====================

        onInit: function() {
            PluginViewController.prototype.onInit.apply(this, arguments);
            this.logger = this.createLogger(this.getMetadata().getName());
            this.initConfigModel();
        },

        onExit: function() {
            if (PluginViewController.prototype.onExit) {
                PluginViewController.prototype.onExit.apply(this, arguments);
            }
        },

        // ==================== CONFIG ====================

        initConfigModel: function() {
            var that = this;
            
            // Try to load config.json
            try {
                var configModel = new JSONModel();
                var sConfigPath = this.getConfigPath();
                
                configModel.loadData(sConfigPath, null, false);
                this.configObject = configModel.getProperty("/") || this.getDefaultConfig();
                
                // Get plant
                try {
                    this.plant = this.getPodController().getUserPlant();
                } catch (e) {
                    this.plant = "LOCAL";
                    this.logger.warning("Could not get plant from POD context");
                }
            } catch (e) {
                this.logger.warning("Could not load config.json, using defaults");
                this.configObject = this.getDefaultConfig();
                this.plant = "LOCAL";
            }
        },

        getConfigPath: function() {
            return "data/config.json";
        },

        getDefaultConfig: function() {
            return {
                DEV: { dmcHost: "localhost", appUrl: "" },
                QA: { dmcHost: "", appUrl: "" },
                PRD: { dmcHost: "", appUrl: "" }
            };
        },

        getEnv: function() {
            var hostname = window.location.hostname;
            
            if (this.configObject.DEV && hostname === this.configObject.DEV.dmcHost) {
                return "DEV";
            }
            if (this.configObject.QA && hostname === this.configObject.QA.dmcHost) {
                return "QA";
            }
            if (this.configObject.PRD && hostname === this.configObject.PRD.dmcHost) {
                return "PRD";
            }
            
            return "DEV";
        },

        // ==================== LOGGER ====================

        createLogger: function(sLoggerName) {
            var logger = jQuery.sap.log.getLogger(sLoggerName);
            logger.setLevel(jQuery.sap.log.Level.INFO);
            return logger;
        },

        // ==================== I18N ====================

        getI18nText: function(stringKey) {
            var oModel = this.getView().getModel("i18n");
            if (oModel) {
                var oBundle = oModel.getResourceBundle();
                if (arguments.length > 1) {
                    var aArgs = Array.prototype.slice.call(arguments, 1);
                    return oBundle.getText(stringKey, aArgs);
                }
                return oBundle.getText(stringKey);
            }
            return stringKey;
        },

        getCurrentLanguage: function() {
            return Localization.getLanguage();
        },

        // ==================== MESSAGES ====================

        showSuccessMessage: function(sMessage, iDuration) {
            MessageToast.show(sMessage, {
                duration: iDuration || 3000,
                at: "center center"
            });
        },

        showErrorMessage: function(sMessage, iDuration) {
            MessageToast.show(sMessage, {
                duration: iDuration || 5000,
                at: "center center",
                styleClass: "errorMessageToast"
            });
        },

        showWarningMessage: function(sMessage, iDuration) {
            MessageToast.show(sMessage, {
                duration: iDuration || 5000,
                at: "center center",
                styleClass: "warningMessageToast"
            });
        },

        showInfoMessage: function(sMessage, iDuration) {
            MessageToast.show(sMessage, {
                duration: iDuration || 3000,
                at: "center center"
            });
        },

        showErrorMessagePopup: function(sMessage) {
            MessageBox.error(sMessage, {
                title: this.getI18nText("ERROR_TITLE") || "Error"
            });
        },

        showWarningMessagePopup: function(sMessage) {
            MessageBox.warning(sMessage, {
                title: this.getI18nText("WARNING_TITLE") || "Warning"
            });
        },

        showInfoMessagePopup: function(sMessage) {
            MessageBox.information(sMessage, {
                title: this.getI18nText("INFO_TITLE") || "Information"
            });
        },

        // ==================== POD SELECTION ====================

        getCurrentSelection: function() {
            var oSelection = {
                sfcId: "",
                shopOrderId: "",
                operationId: "",
                materialId: "",
                workCenterId: "",
                resourceId: "",
                quantity: ""
            };

            try {
                var oPodSelectionModel = this.getPodSelectionModel();
                
                if (oPodSelectionModel && oPodSelectionModel.getSelection()) {
                    var sel = oPodSelectionModel.getSelection();
                    
                    if (sel.getSfc && sel.getSfc()) {
                        oSelection.sfcId = sel.getSfc().sfc || "";
                    }
                    
                    if (sel.getShopOrder && sel.getShopOrder()) {
                        oSelection.shopOrderId = sel.getShopOrder().shopOrder || "";
                    }
                    
                    if (sel.getSfcData && sel.getSfcData()) {
                        var sfcData = sel.getSfcData();
                        oSelection.materialId = sfcData.material || "";
                        oSelection.quantity = sfcData.quantity || "";
                        oSelection.resourceId = sfcData.resource || "";
                    }
                }
                
                if (oPodSelectionModel && oPodSelectionModel.getOperations()) {
                    var ops = oPodSelectionModel.getOperations();
                    if (ops.length > 0) {
                        oSelection.operationId = ops[0].operation || "";
                    }
                }
                
                if (oPodSelectionModel && oPodSelectionModel.getWorkCenter()) {
                    oSelection.workCenterId = oPodSelectionModel.getWorkCenter() || "";
                }
                
                if (oPodSelectionModel && oPodSelectionModel.getResource()) {
                    var res = oPodSelectionModel.getResource();
                    oSelection.resourceId = res.resource || oSelection.resourceId;
                }
                
            } catch (e) {
                this.logger.warning("Could not get POD selection: " + e.message);
            }

            return oSelection;
        },

        isSfcStateActive: function() {
            try {
                var oPodSelectionModel = this.getPodSelectionModel();
                if (oPodSelectionModel && oPodSelectionModel.getSelection()) {
                    var sfcData = oPodSelectionModel.getSelection().getSfcData();
                    if (sfcData && sfcData.getStatusCode) {
                        return sfcData.getStatusCode() === this.SFC_STATE_ACTIVE;
                    }
                }
            } catch (e) {
                this.logger.warning("Could not check SFC state: " + e.message);
            }
            return false;
        },

        // ==================== BUSY INDICATOR ====================

        startBusyIndicatorWatchdog: function(iTimeout) {
            var that = this;
            setTimeout(function() {
                BusyIndicator.hide();
            }, iTimeout || 10000);
        },

        // ==================== PRODUCTION PROCESS ====================

        /**
         * Calls a Production Process via POST.
         *
         * URL: {peRestDataSourceUri}/api/v1/process/processDefinitions/start?key={regKey}&async=false&logLevel=Error
         *
         * IMPORTANT: getPeRestDataSourceUri() already returns a path ending in /pe/
         * (e.g. ../sapdmdmepod/~xxx~/dmi/pe/) so we only append /api/v1/... NOT /pe/api/v1/...
         *
         * @param {string} sRegKey - Production Process registry key
         * @param {object} oParams - Parameters to send
         * @param {string} sModelName - Model name for response
         * @param {function} fnCallback - function(oController, oResponseData, oErrorDetails, oOriginalParams)
         */
        doProductionProcessCallPost: function(sRegKey, oParams, sModelName, fnCallback) {
            var that = this;

            this.logger.info("Production Process call: key=" + sRegKey + ", model=" + sModelName);
            this.logger.info("PP Params: " + JSON.stringify(oParams));

            // Build URL: getPeRestDataSourceUri() returns path ending in /pe/
            // so we append /api/v1/... (NOT /pe/api/v1/...)
            try {
                var sPeUri = this.getPeRestDataSourceUri();
                if (sPeUri) {
                    // Remove trailing slash if present, then append path
                    var sBaseUrl = sPeUri.replace(/\/+$/, "");
                    var sUrl = sBaseUrl + "/api/v1/process/processDefinitions/start?key=" + encodeURIComponent(sRegKey) + "&async=false&logLevel=Error";
                    this.logger.info("PP URL: " + sUrl);

                    this.ajaxPostRequest(sUrl, oParams,
                        function(oResponseData) {
                            that.logger.info("PP response received for model: " + sModelName);
                            if (fnCallback) {
                                fnCallback(that, oResponseData, null, oParams);
                            }
                        },
                        function(oError) {
                            that.logger.error("PP error: " + JSON.stringify(oError));
                            if (fnCallback) {
                                fnCallback(that, null, oError, oParams);
                            }
                        }
                    );
                    return;
                }
            } catch (e) {
                this.logger.warning("getPeRestDataSourceUri not available: " + e.message);
            }

            // Local fallback: delegate to PluginViewController mock
            if (PluginViewController.prototype.doProductionProcessCallPost) {
                return PluginViewController.prototype.doProductionProcessCallPost.call(this, sRegKey, oParams, sModelName, fnCallback);
            }

            this.logger.error("No Production Process implementation available");
            if (fnCallback) {
                fnCallback(that, null, { message: "doProductionProcessCallPost not available" }, oParams);
            }
        },

        /**
         * Gets a Production Process registry value from config.
         * @param {string} sRegKey - Registry key
         * @returns {string} Registry value or "notDefined"
         */
        getPpRegistryValue: function(sRegKey) {
            var env = this.getEnv();
            if (this.configObject && this.configObject[env] && this.configObject[env][sRegKey]) {
                return this.configObject[env][sRegKey];
            }
            return "notDefined";
        }
    });
});
