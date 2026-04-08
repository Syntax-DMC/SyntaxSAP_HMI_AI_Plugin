/* ProductionUIComponent Mock
   Für lokales Testing - simuliert SAP DM POD Foundation
*/
sap.ui.define([
    "sap/ui/core/UIComponent"
], function(UIComponent) {
    "use strict";

    return UIComponent.extend("sap.dm.dme.podfoundation.component.production.ProductionUIComponent", {
        metadata: {
            manifest: "json"
        }
    });
});
