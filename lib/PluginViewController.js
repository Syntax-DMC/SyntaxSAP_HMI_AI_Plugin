/* PluginViewController Mock
   Für lokales Testing - simuliert SAP DM POD Foundation
*/
sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function(Controller) {
    "use strict";

    return Controller.extend("sap.dm.dme.podfoundation.controller.PluginViewController", {

        onInit: function() {
            // Mock initialization
        },

        onExit: function() {
            // Mock cleanup
        },

        // Mock POD methods
        getPodController: function() {
            return {
                getUserPlant: function() { return "LOCAL_PLANT"; }
            };
        },

        getPodSelectionModel: function() {
            return null;
        },

        getConfiguration: function() {
            return {};
        },

        subscribe: function(sEvent, fnHandler, oContext) {
            // Mock event subscription
        },

        unsubscribe: function(sEvent, fnHandler, oContext) {
            // Mock event unsubscription
        },

        isEventFiredByThisPlugin: function(oData) {
            return false;
        },

        // Mock AJAX methods
        ajaxGetRequest: function(sUrl, oParams, fnSuccess, fnError) {
            console.log("Mock GET:", sUrl, oParams);
            if (fnError) {
                fnError("Mock mode - no backend");
            }
        },

        ajaxPostRequest: function(sUrl, oBody, fnSuccess, fnError) {
            console.log("Mock POST:", sUrl, oBody);
            if (fnError) {
                fnError("Mock mode - no backend");
            }
        },

        getPublicApiRestDataSourceUri: function() {
            return "https://mock-api.local";
        },

        getPeRestDataSourceUri: function() {
            return null;
        },

        /**
         * Mock for doProductionProcessCallPost.
         * Only used locally - in real POD the base PluginViewController provides the real implementation.
         */
        doProductionProcessCallPost: function(sRegKey, oParams, sModelName, fnCallback) {
            var that = this;
            console.log("Mock PP call: key=" + sRegKey + ", params=", oParams);

            setTimeout(function() {
                if (fnCallback) {
                    var oMockResponse = {
                        summary: "Mock: Production Process '" + sRegKey + "' wurde lokal simuliert.",
                        insights: [
                            "Dies ist eine lokale Test-Antwort.",
                            "Im echten POD wird der Production Process via DM API aufgerufen."
                        ],
                        recommendedNextSteps: [
                            { label: "Plugin im POD testen", type: "INFO" }
                        ],
                        disclaimer: "Syntax Copilot schl\u00e4gt vor \u2013 der Mensch entscheidet."
                    };
                    fnCallback(that, oMockResponse, null, oParams);
                }
            }, 1500);
        }
    });
});
