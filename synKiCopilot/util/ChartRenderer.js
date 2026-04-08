/**
 * Chart Renderer Utility Module
 * Pure functions for extracting chart blocks from Markdown
 * and rendering them as CSS-based HTML bar charts.
 *
 * @namespace syntax.max.ai.synKiCopilot.util.ChartRenderer
 */
sap.ui.define([
    "./Formatter"
], function(Formatter) {
    "use strict";

    var CHART_COLORS = ["#0632A0", "#1EB4E6", "#2ECC71", "#E67E22", "#9B59B6", "#E74C3C", "#1ABC9C", "#F39C12"];

    var ChartRenderer = {

        /**
         * Extracts ```chart ... ``` blocks from Markdown text.
         * Replaces them with {{CHART_N}} placeholders.
         * @param {string} sText - Markdown text with possible chart blocks
         * @returns {object} { markdown: string, charts: Array }
         */
        extractChartBlocks: function(sText) {
            if (!sText) {
                return { markdown: "", charts: [] };
            }

            var aCharts = [];
            var iIndex = 0;

            var sMarkdown = sText.replace(/```chart\s*\n([\s\S]*?)```/g, function(sMatch, sJson) {
                try {
                    var oChartData = JSON.parse(sJson.trim());
                    aCharts.push({ index: iIndex, data: oChartData });
                } catch (e) {
                    aCharts.push({ index: iIndex, data: null });
                }
                var sPlaceholder = "{{CHART_" + iIndex + "}}";
                iIndex++;
                return sPlaceholder;
            });

            return { markdown: sMarkdown, charts: aCharts };
        },

        /**
         * Replaces {{CHART_N}} placeholders with rendered chart HTML.
         * @param {string} sHtml - HTML with chart placeholders
         * @param {Array} aCharts - Chart data array from extractChartBlocks
         * @returns {string} HTML with charts rendered
         */
        insertChartHtml: function(sHtml, aCharts) {
            if (!sHtml || !aCharts || aCharts.length === 0) {
                return sHtml || "";
            }

            var that = this;

            aCharts.forEach(function(oChart) {
                var sPlaceholder = "{{CHART_" + oChart.index + "}}";
                // Remove wrapping <p> tag if placeholder was in a paragraph
                var sWrapped = "<p>" + sPlaceholder + "</p>";
                var sChartHtml = oChart.data ? that.renderChart(oChart.data) : "";

                if (sHtml.indexOf(sWrapped) > -1) {
                    sHtml = sHtml.replace(sWrapped, sChartHtml);
                } else {
                    sHtml = sHtml.replace(sPlaceholder, sChartHtml);
                }
            });

            return sHtml;
        },

        /**
         * Renders a chart as CSS-based HTML.
         * Supports bar charts.
         * @param {object} oChartData - { type, title, data: [{ label, value }] }
         * @returns {string} Chart HTML
         */
        renderChart: function(oChartData) {
            if (!oChartData || !oChartData.data || oChartData.data.length === 0) {
                return "";
            }

            var nMax = 0;
            oChartData.data.forEach(function(oItem) {
                if (oItem.value > nMax) { nMax = oItem.value; }
            });
            if (nMax === 0) { nMax = 1; }

            var aHtml = ['<div class="synCopilotChart">'];

            if (oChartData.title) {
                aHtml.push('<div class="synCopilotChartTitle">' + Formatter.escapeHtml(oChartData.title) + '</div>');
            }

            oChartData.data.forEach(function(oItem, iIdx) {
                var nPercent = Math.round((oItem.value / nMax) * 100);
                var sColor = CHART_COLORS[iIdx % CHART_COLORS.length];

                aHtml.push('<div class="synCopilotChartBar">');
                aHtml.push('<div class="synCopilotChartLabel" title="' + Formatter.escapeHtml(oItem.label) + '">' + Formatter.escapeHtml(oItem.label) + '</div>');
                aHtml.push('<div class="synCopilotChartBarTrack">');
                aHtml.push('<div class="synCopilotChartBarFill" style="width:' + nPercent + '%;background:' + sColor + ';"></div>');
                aHtml.push('</div>');
                aHtml.push('<div class="synCopilotChartValue">' + oItem.value + '</div>');
                aHtml.push('</div>');
            });

            aHtml.push('</div>');
            return aHtml.join("");
        }
    };

    return ChartRenderer;
});
