sap.ui.define([
    "sap/ui/model/json/JSONModel"
], function(JSONModel) {
    "use strict";

    return {
        createViewModel: function() {
            return new JSONModel({
                busy: false,
                data: []
            });
        }
    };
});
