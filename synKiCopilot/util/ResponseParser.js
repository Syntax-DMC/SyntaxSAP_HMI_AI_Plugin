/**
 * Response Parser Utility Module
 * Pure functions for extracting output from various backend response formats.
 * Handles PP responses, Gateway responses, malformed JSON, nested wrapping.
 *
 * @namespace syntax.max.ai.synKiCopilot.util.ResponseParser
 */
sap.ui.define([], function() {
    "use strict";

    var ResponseParser = {

        /**
         * Unescapes JSON string sequences including \uXXXX unicode.
         * @param {string} sVal - JSON-escaped string content
         * @returns {string} Unescaped string
         */
        unescapeJsonString: function(sVal) {
            if (!sVal) {
                return "";
            }
            return sVal
                .replace(/\\\\/g, "\x00")
                .replace(/\\n/g, "\n")
                .replace(/\\t/g, "\t")
                .replace(/\\r/g, "\r")
                .replace(/\\"/g, '"')
                .replace(/\\u([0-9a-fA-F]{4})/g, function(match, hex) {
                    return String.fromCharCode(parseInt(hex, 16));
                })
                .replace(/\x00/g, "\\");
        },

        /**
         * Extracts the "output" value from a malformed JSON string.
         * Uses lastIndexOf to find boundaries instead of JSON.parse.
         * Handles cases where the PP produces invalid JSON escaping.
         * @param {string} sJson - The malformed JSON string like {"output": "..."}
         * @returns {string|null} The extracted output, or null
         */
        extractFromMalformedJson: function(sJson) {
            if (!sJson) {
                return null;
            }

            // Find "output" key
            var iKey = sJson.indexOf('"output"');
            if (iKey === -1) {
                return null;
            }

            // Find colon after key
            var iColon = sJson.indexOf(":", iKey + 8);
            if (iColon === -1) {
                return null;
            }

            // Find opening quote of value (skip whitespace after colon)
            var iStart = iColon + 1;
            while (iStart < sJson.length && sJson.charAt(iStart) === " ") {
                iStart++;
            }
            if (iStart >= sJson.length || sJson.charAt(iStart) !== '"') {
                return null;
            }
            iStart++; // skip opening quote

            // Find closing: last '"' before the final '}' (or just last '"')
            var iEnd = sJson.lastIndexOf('"');
            if (iEnd <= iStart) {
                return null;
            }

            // Extract raw value and unescape
            var sVal = this.unescapeJsonString(sJson.substring(iStart, iEnd));

            return sVal.length > 0 ? sVal : null;
        },

        /**
         * Scans a stringified response for "output" values and returns the
         * deepest Markdown content. Works regardless of response format:
         * objects, strings, nested JSON, malformed JSON, any wrapping level.
         * @param {string} sRaw - JSON.stringify'd or raw response string
         * @returns {string|null} The Markdown output string, or null
         */
        extractDeepestOutput: function(sRaw) {
            if (!sRaw || sRaw.length < 10) {
                return null;
            }

            var that = this;
            var sBest = null;
            var iSearchFrom = 0;

            while (iSearchFrom < sRaw.length) {
                // Find next "output" key
                var iKey = sRaw.indexOf('"output"', iSearchFrom);
                if (iKey === -1) {
                    break;
                }

                // Find colon after key
                var iColon = sRaw.indexOf(":", iKey + 8);
                if (iColon === -1) {
                    break;
                }

                // Skip whitespace after colon
                var iPos = iColon + 1;
                while (iPos < sRaw.length && sRaw.charAt(iPos) === " ") {
                    iPos++;
                }

                // Must be a string value (opening quote)
                if (iPos >= sRaw.length || sRaw.charAt(iPos) !== '"') {
                    iSearchFrom = iPos + 1;
                    continue;
                }

                // Walk the string value respecting escape sequences
                var iStart = iPos + 1;
                var iEnd = iStart;
                while (iEnd < sRaw.length) {
                    var ch = sRaw.charAt(iEnd);
                    if (ch === "\\") {
                        iEnd += 2; // skip escaped character
                    } else if (ch === '"') {
                        break; // found closing quote
                    } else {
                        iEnd++;
                    }
                }

                // Extract and unescape the value
                var sVal = this.unescapeJsonString(sRaw.substring(iStart, iEnd));

                // Prefer the longest non-JSON-looking value (= the actual Markdown)
                if (sVal.length > 0) {
                    var bLooksLikeJson = sVal.charAt(0) === "{" && sVal.indexOf('"output"') !== -1;
                    if (bLooksLikeJson) {
                        // Value looks like JSON with inner "output" - recurse into it
                        var sInner = that.extractDeepestOutput(sVal);
                        if (sInner && (!sBest || sInner.length > sBest.length)) {
                            sBest = sInner;
                        }
                    } else if (!sBest || sVal.length > sBest.length) {
                        sBest = sVal;
                    }
                }

                iSearchFrom = iEnd + 1;
            }

            return sBest;
        },

        /**
         * Agent may return structured JSON wrapped in a Markdown code block.
         * @param {string} sText - Output text possibly containing a JSON code block
         * @returns {object} { json: parsed object or null, textBefore: string, textAfter: string }
         */
        extractJsonBlock: function(sText) {
            if (!sText) {
                return { json: null, textBefore: "", textAfter: "" };
            }

            var oMatch = sText.match(/```json\s*\n([\s\S]*?)```/);
            if (!oMatch) {
                return { json: null, textBefore: sText, textAfter: "" };
            }

            try {
                var oJson = JSON.parse(oMatch[1].trim());
                var iStart = sText.indexOf(oMatch[0]);
                var iEnd = iStart + oMatch[0].length;
                return {
                    json: oJson,
                    textBefore: sText.substring(0, iStart).trim(),
                    textAfter: sText.substring(iEnd).trim()
                };
            } catch (e) {
                return { json: null, textBefore: sText, textAfter: "" };
            }
        },

        /**
         * Extracts the output string from a backend response object.
         * Handles all known response formats from PP and Gateway:
         * - { response: "{\"output\": \"...\"}" } (stringified)
         * - { response: { output: "..." } } (object)
         * - { output: "..." } (flat)
         * - { answer: "..." } (gateway)
         * - Plain Markdown string
         * @param {*} oResponse - The raw backend response
         * @returns {string|null} The extracted output string, or null
         */
        extractOutput: function(oResponse) {
            if (!oResponse) {
                return null;
            }

            // If response is a string, try to parse or use directly
            if (typeof oResponse === "string") {
                if (oResponse.indexOf('"output"') !== -1) {
                    // Try deep extraction from stringified response
                    var sDeep = this.extractDeepestOutput(oResponse);
                    if (sDeep) {
                        return sDeep;
                    }
                }
                return oResponse;
            }

            if (typeof oResponse !== "object" || oResponse === null) {
                return null;
            }

            // Check for error responses
            if (oResponse.errors && oResponse.errors.length > 0) {
                return null; // caller should handle errors separately
            }

            var sOutput = null;
            var oPayload = oResponse.response || oResponse;

            // If payload is a string, parse it
            if (typeof oPayload === "string") {
                var sPayloadStr = oPayload.trim();

                // Strip markdown code block wrapper if present
                var oCodeBlock = sPayloadStr.match(/^```(?:json)?\s*\n?([\s\S]*?)\n?\s*```$/);
                if (oCodeBlock) {
                    sPayloadStr = oCodeBlock[1].trim();
                }

                try {
                    oPayload = JSON.parse(sPayloadStr);
                } catch (e) {
                    if (sPayloadStr.indexOf('"output"') !== -1) {
                        sOutput = this.extractFromMalformedJson(sPayloadStr);
                    } else {
                        sOutput = sPayloadStr;
                    }
                    oPayload = null;
                }
            }

            // Traverse object for output field
            if (!sOutput && oPayload && typeof oPayload === "object") {
                var vOutput = oPayload.output;

                if (typeof vOutput === "string") {
                    try {
                        var oParsed = JSON.parse(vOutput);
                        if (oParsed && typeof oParsed.output === "string") {
                            sOutput = oParsed.output;
                        }
                    } catch (e) {
                        if (vOutput.charAt(0) !== "{") {
                            sOutput = vOutput;
                        }
                    }
                } else if (typeof vOutput === "object" && vOutput !== null && typeof vOutput.output === "string") {
                    sOutput = vOutput.output;
                }

                // Gateway format: { answer: "..." }
                if (!sOutput && typeof oPayload.answer === "string") {
                    sOutput = oPayload.answer;
                }
            }

            // Fallback: nuclear string scan
            if (!sOutput) {
                var sRaw;
                try { sRaw = JSON.stringify(oResponse); } catch (e) { sRaw = String(oResponse); }
                sOutput = this.extractDeepestOutput(sRaw);
            }

            // Fallback: summary field
            if (!sOutput && typeof oResponse === "object") {
                var oFallback = oResponse.response || oResponse;
                if (oFallback && oFallback.summary) {
                    sOutput = oFallback.summary;
                }
            }

            return sOutput || null;
        }
    };

    return ResponseParser;
});
