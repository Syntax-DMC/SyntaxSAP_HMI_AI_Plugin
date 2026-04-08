/**
 * Formatter Utility Module
 * Pure functions for HTML escaping, sanitization, and Markdown-to-HTML conversion.
 * Extracted from SynKiCopilot.controller.js for testability and reusability.
 *
 * @namespace syntax.max.ai.synKiCopilot.util.Formatter
 */
sap.ui.define([], function() {
    "use strict";

    var Formatter = {

        /**
         * Escapes HTML special characters to prevent XSS.
         * @param {string} sText - Raw text
         * @returns {string} Escaped text safe for HTML insertion
         */
        escapeHtml: function(sText) {
            if (!sText) {
                return "";
            }
            return String(sText)
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#39;");
        },

        /**
         * Sanitizes HTML by removing dangerous elements and attributes.
         * Defense-in-depth layer before innerHTML injection.
         * @param {string} sHtml - HTML string (already escaped where needed)
         * @returns {string} Sanitized HTML
         */
        sanitizeHtml: function(sHtml) {
            if (!sHtml) {
                return "";
            }
            // Remove script tags and content
            var sSafe = sHtml.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
            // Remove iframe, object, embed, form tags
            sSafe = sSafe.replace(/<\s*\/?\s*(iframe|object|embed|form|applet|base|link|meta)\b[^>]*>/gi, "");
            // Remove on* event handlers from attributes
            sSafe = sSafe.replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "");
            // Remove javascript: protocol in href/src
            sSafe = sSafe.replace(/(href|src)\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*')/gi, '$1=""');
            // Remove data: protocol in src (potential XSS via data URIs)
            sSafe = sSafe.replace(/src\s*=\s*(?:"data:[^"]*"|'data:[^']*')/gi, 'src=""');
            return sSafe;
        },

        /**
         * Converts Markdown text to HTML.
         * Supports: headers, bold, italic, lists, tables, code blocks, hr, line breaks.
         * @param {string} sMarkdown - Markdown text
         * @returns {string} HTML string
         */
        markdownToHtml: function(sMarkdown) {
            if (!sMarkdown) {
                return "";
            }

            var that = this;
            var aLines = sMarkdown.split("\n");
            var aHtml = [];
            var bInList = false;
            var sListType = "";
            var bInTable = false;
            var bTableHeaderDone = false;
            var bInCodeBlock = false;
            var aCodeLines = [];

            for (var i = 0; i < aLines.length; i++) {
                var sLine = aLines[i];

                // Fenced code block (``` or ```lang)
                if (/^```/.test(sLine.trim())) {
                    if (!bInCodeBlock) {
                        if (bInList) { aHtml.push("</" + sListType + ">"); bInList = false; }
                        if (bInTable) { aHtml.push("</table>"); bInTable = false; }
                        bInCodeBlock = true;
                        aCodeLines = [];
                    } else {
                        bInCodeBlock = false;
                        aHtml.push("<pre><code>" + this.escapeHtml(aCodeLines.join("\n")) + "</code></pre>");
                        aCodeLines = [];
                    }
                    continue;
                }

                if (bInCodeBlock) {
                    aCodeLines.push(sLine);
                    continue;
                }

                // Horizontal rule
                if (/^---+\s*$/.test(sLine)) {
                    if (bInList) { aHtml.push("</" + sListType + ">"); bInList = false; }
                    if (bInTable) { aHtml.push("</table>"); bInTable = false; }
                    aHtml.push("<hr>");
                    continue;
                }

                // Table row
                if (/^\|(.+)\|$/.test(sLine.trim())) {
                    if (bInList) { aHtml.push("</" + sListType + ">"); bInList = false; }

                    if (/^\|[\s\-:|]+\|$/.test(sLine.trim())) {
                        bTableHeaderDone = true;
                        continue;
                    }

                    if (!bInTable) {
                        aHtml.push("<table>");
                        bInTable = true;
                        bTableHeaderDone = false;
                    }

                    var aCells = sLine.trim().split("|").filter(function(s) { return s.trim() !== ""; });
                    var sTag = !bTableHeaderDone ? "th" : "td";
                    aHtml.push("<tr>");
                    aCells.forEach(function(sCell) {
                        aHtml.push("<" + sTag + ">" + that.inlineMarkdown(sCell.trim()) + "</" + sTag + ">");
                    });
                    aHtml.push("</tr>");
                    continue;
                }

                if (bInTable) {
                    aHtml.push("</table>");
                    bInTable = false;
                    bTableHeaderDone = false;
                }

                // Headers
                if (/^#### (.+)$/.test(sLine)) {
                    if (bInList) { aHtml.push("</" + sListType + ">"); bInList = false; }
                    aHtml.push("<h4>" + this.inlineMarkdown(sLine.replace(/^#### /, "")) + "</h4>");
                    continue;
                }
                if (/^### (.+)$/.test(sLine)) {
                    if (bInList) { aHtml.push("</" + sListType + ">"); bInList = false; }
                    aHtml.push("<h3>" + this.inlineMarkdown(sLine.replace(/^### /, "")) + "</h3>");
                    continue;
                }
                if (/^## (.+)$/.test(sLine)) {
                    if (bInList) { aHtml.push("</" + sListType + ">"); bInList = false; }
                    aHtml.push("<h2>" + this.inlineMarkdown(sLine.replace(/^## /, "")) + "</h2>");
                    continue;
                }

                // Unordered list
                if (/^[\-\*] (.+)$/.test(sLine)) {
                    if (!bInList || sListType !== "ul") {
                        if (bInList) { aHtml.push("</" + sListType + ">"); }
                        aHtml.push("<ul>");
                        bInList = true;
                        sListType = "ul";
                    }
                    var sRawItem = sLine.replace(/^[\-\*] /, "");
                    var sRenderedItem = this.inlineMarkdown(sRawItem);
                    // Detect clickable suggestions
                    var sStripped = sRawItem.replace(/^[""\u201e\u201c\u201d\u00ab\u00bb]|[""\u201e\u201c\u201d\u00ab\u00bb]$/g, "").trim();
                    var bQuoted = /^[""\u201e\u201c\u201d\u00ab\u00bb]/.test(sRawItem) && /[""\u201e\u201c\u201d\u00ab\u00bb]$/.test(sRawItem);
                    var bQuestion = /\?[""\u201e\u201c\u201d\u00ab\u00bb]?$/.test(sRawItem);
                    if ((bQuoted || bQuestion) && sStripped.length > 5) {
                        sRenderedItem = '<span class="synCopilotSuggestion" data-query="' + this.escapeHtml(sStripped) + '">' + sRenderedItem + '</span>';
                    }
                    aHtml.push("<li>" + sRenderedItem + "</li>");
                    continue;
                }

                // Ordered list
                if (/^\d+\. (.+)$/.test(sLine)) {
                    if (!bInList || sListType !== "ol") {
                        if (bInList) { aHtml.push("</" + sListType + ">"); }
                        aHtml.push("<ol>");
                        bInList = true;
                        sListType = "ol";
                    }
                    aHtml.push("<li>" + this.inlineMarkdown(sLine.replace(/^\d+\. /, "")) + "</li>");
                    continue;
                }

                if (bInList) {
                    aHtml.push("</" + sListType + ">");
                    bInList = false;
                }

                if (sLine.trim() === "") {
                    continue;
                }

                aHtml.push("<p>" + this.inlineMarkdown(sLine) + "</p>");
            }

            if (bInList) { aHtml.push("</" + sListType + ">"); }
            if (bInTable) { aHtml.push("</table>"); }
            if (bInCodeBlock) { aHtml.push("<pre><code>" + this.escapeHtml(aCodeLines.join("\n")) + "</code></pre>"); }

            return aHtml.join("");
        },

        /**
         * Converts inline Markdown to HTML (bold, italic, code).
         * Input is HTML-escaped first to prevent XSS.
         * @param {string} sText - Inline Markdown text
         * @returns {string} HTML string
         */
        inlineMarkdown: function(sText) {
            if (!sText) {
                return "";
            }

            var s = this.escapeHtml(sText);
            s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
            s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
            s = s.replace(/\*([^*]+)\*/g, "<em>$1</em>");
            return s;
        }
    };

    return Formatter;
});
