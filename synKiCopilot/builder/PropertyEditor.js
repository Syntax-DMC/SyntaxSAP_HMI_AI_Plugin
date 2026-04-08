sap.ui.define([
    "sap/ui/model/resource/ResourceModel",
    "sap/dm/dme/podfoundation/control/PropertyEditor"
], function(ResourceModel, PropertyEditor) {
    "use strict";

    return PropertyEditor.extend("syntax.max.ai.synKiCopilot.builder.PropertyEditor", {

        constructor: function(sId, mSettings) {
            PropertyEditor.apply(this, arguments);

            this.setI18nKeyPrefix("synKiCopilot.");
            this.setResourceBundleName("syntax.max.ai.synKiCopilot.i18n.builder");
            this.setPluginResourceBundleName("syntax.max.ai.synKiCopilot.i18n.i18n");
        },

        addPropertyEditorContent: function(oPropertyFormContainer) {
            var oData = this.getPropertyData();

            // Connection Mode Switch (OFF = Production Process, ON = Gateway)
            this.addSwitch(oPropertyFormContainer, "useGateway", oData);

            // Production Process Key (visible when useGateway = false)
            this.addInputField(oPropertyFormContainer, "productionProcessKey", oData);

            // Gateway URL (visible when useGateway = true)
            this.addInputField(oPropertyFormContainer, "gatewayUrl", oData);

            // Gateway Token (visible when useGateway = true)
            this.addInputField(oPropertyFormContainer, "gatewayToken", oData);

            // Debug Timing Switch (shows request/response timestamps)
            this.addSwitch(oPropertyFormContainer, "showDebugTiming", oData);
        },

        getDefaultPropertyData: function() {
            return {
                useGateway: false,
                productionProcessKey: "",
                gatewayUrl: "",
                gatewayToken: "",
                showDebugTiming: false
            };
        }
    });
});
