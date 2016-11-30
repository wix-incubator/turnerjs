/**
 * Created by IntelliJ IDEA.
 * User: Idoro
 * Date: 15/02/11
 * Time: 16:07
 * To change this template use File | Settings | File Templates.
 */
(function() {
    // Create a temp stylesheet & rule objects in order to check capabilities.
    // In order to create a styleheet (in a cross browser way) we create a style node in the
    // head and then we find the corresponding stylesheet object that was created from it.
    var styleNode, styleSheet, styleRule,
            NODE_SHEET, OWNER_NODE, RULE_LIST, DELETE_RULE, CSS_TEXT;

    //Create a style node in head // ToDo: remove teswtign stylesheet
    styleNode = document.createElement('style');
    styleNode.id = 'testCss';
    document.getElementsByTagName('head')[0].appendChild(styleNode);

    //styleNode = new Element('style', {'id':'testCss'}).inject(document.head);
    // Find style node sheet reference param
    NODE_SHEET = (styleNode.sheet) ? 'sheet' : 'styleSheet';
    // Get an antonymous stylesheet
    styleSheet = styleNode[NODE_SHEET];
    if(!styleSheet) {
       LOG.reportError(wixErrors.UTILS_STYLE_NOT_FOUND,"Styles","feature detection");
    }
    // Find stylesheet params
    OWNER_NODE = (styleSheet.ownerNode) ? 'ownerNode' : 'owningElement';
    DELETE_RULE = (styleSheet.deleteRule) ? 'deleteRule' : 'removeRule';
    RULE_LIST = (styleSheet.cssRules) ? 'cssRules' : 'rules';

    /******************************************************************
     *  Unified cross browser functions
     ******************************************************************/

    var sanitizeSelector = function(selector) {
//        return selector.replace(/[\s]?>[\s]?/g,">").replace(/^\s/g,"").replace(/\s$/g,"").replace(/\s/," ").replace(/"/g,"'");
//        return selector.replace(/^\s/g,"").replace(/\s$/g,"").replace(/\s/," ").replace(/"/g,"'");
        //return selector.replace(/[\s]+/g," ").replace(/"/g,"'").replace(/^(\s+)|(\s+$)/, '');
        return selector.replace(/[\s]+/g, " ").replace(/'/g, '"').replace(/^\s+/, '').replace(/\s*$/, '');
    };

    /** Function createStyleRule
     * Add a rule to a style sheet
     * Parametes:
     * - selector - CSS selector (e.g. "#nodeId div")
     * - rules - Set of css rules divided by ; (e.g. "color:green; font-size:12px")
     * Returns:
     * A style rule object
     */
    var createRule;
    if (styleSheet.insertRule) { // W3
        createRule = function(selector, rules) {
            selector = sanitizeSelector(selector);
            if (this._rulesMap[selector]) {
               LOG.reportError(wixErrors.UTILS_RULE_ALREADY_EXIST, 'Styles', "createRule", selector + "");
                return;
            }
            var ruleIndex = this.insertRule(selector + '{' + rules + '}', this.cssRules.length);
            var styleRule = this.cssRules[ruleIndex];
            this._rulesMap[selector] = styleRule;
            this._browserSelectorMapping[selector] = styleRule.selectorText;
            return styleRule;
        };
    } else { // IE
        createRule = function(selector, rules) {
            selector = sanitizeSelector(selector);

            if (this._rulesMap[selector]) {
               LOG.reportError(wixErrors.UTILS_RULE_ALREADY_EXIST, "Styles", "createRule", selector + "");
                return;
            }
            var ruleIndex = this.addRule(selector, rules);

            // Get style rule. IE7 returns -1 instead of rule index. so we need to find it the hard way.
            var styleRule;
            if (ruleIndex != -1) {
                styleRule = this.rules[ruleIndex];
            } else {
                for (var i = 0; i < this.rules.length; ++i) {
                    if (this.rules[i].selectorText == selector) {
                        styleRule = this.rules[i];
                        break;
                    }
                }
            }
            this._rulesMap[selector] = styleRule;
            this._browserSelectorMapping[selector] = styleRule.selectorText;
            return styleRule;
        };
    }

    //******************************************************************
    
    // Create a rule and check rule params
    styleSheet._rulesMap = {};
    styleSheet._browserSelectorMapping = {};
    styleRule = createRule.apply(styleSheet, ['#tempSelector', 'color:black;']);
    CSS_TEXT = (styleRule.cssText) ? 'cssText' : 'no_support';

    
    //******************************************************************

    /** Function getStyleSheet
     * Return the stylesheed of the style node
     * Returns:
     * StyleSheet object
     */
    var getStyleSheet = function() {
        return this[NODE_SHEET];
    };

    /** Function getRuleList
     * Return a list of rules that belong to the stylesheet
     */
    var getRuleList = function() {
        return this[RULE_LIST];
    };

    /** Function removeStyleSheet
     * Remove stylesheet from document
     */
    var removeStyleSheet = function() {
        this._rulesMap = undefined;
        this.styleNode.dispose();
    };

    /** Function clearRules
     * Removes all rules from stylesheet
     */
    var clearRules = function() {
        this._rulesMap = [];
        for (var i = this[RULE_LIST].length - 1; i >= 0; --i) {
            this[DELETE_RULE](i);
        }
    };

    /** Function getRuleBySelector
     * Search the first rule that matches the selector and return it.
     * Paramaeter:
     * - selector - selector to search
     * Returns:
     * style rule object (Null if none is found).
     */
    var getRuleBySelector = function(selector) {
        selector = sanitizeSelector(selector);
        return (this._rulesMap[selector]) ? this._rulesMap[selector] : null;
    };

    /** Function removeRuleBySelector
     * Search rules matching selector and remove them.
     * Paramaeter:
     * - selector - selector to search
     * Returns:
     * Return true if rules are found and removed
     */
    var removeRuleBySelector = function(selector) {
        selector = sanitizeSelector(selector);
        var isFound = false;
        if (this._rulesMap[selector]) {
            var browserSelector = this._browserSelectorMapping[selector];
            var initIndex = this[RULE_LIST].length - 1;
            for (var i = initIndex; i >= 0; --i) {
                if (this[RULE_LIST][i].selectorText == browserSelector) {
                    this[DELETE_RULE](i);
                    isFound = true;
                }
            }
            delete this._rulesMap[selector];
        }
        return isFound;
    };

    /** Function updateRule
     * Search for a selector and replace its rules.
     * If no selector is found then create one.
     * - selector - Selector to update
     * - rules - Rules to update
     * Returns:
     * Rule that was changed
     */
    var updateRule;
    if (styleSheet.cssRules) { // W3
        updateRule = function(selector, rules) {
            selector = sanitizeSelector(selector);
//            if(this._rulesMap[selector]) {
//                var beforeAmount = this[RULE_LIST].length;
//                if(this.removeRuleBySelector(selector)) {
//                    if(beforeAmount <= this[RULE_LIST].length) d e b u g g e r;
//                }
//                delete this._rulesMap[selector];
//            }
//            return this.createRule(selector, rules);
            var rule = this._rulesMap[selector];
            if (!rule) {
                rule = this.createRule(selector, rules);
                this._rulesMap[selector] = rule;
            } else {
                rule.style[CSS_TEXT] = rules;
            }
            return rule;
        };
    } else { // IE
        updateRule = function(selector, rules) {
            selector = sanitizeSelector(selector);
            if (this._rulesMap[selector]) {
                this.removeRuleBySelector(selector);
                delete this._rulesMap[selector];
            }
            return this.createRule(selector, rules);
        };
    }


    define.utils('createStyleSheet:this', function(){
        /** Function createStyleSheet
         * Adds a style node to the header and return the result styleSheet object
         * Parameters:
         * - styleIdPrefix - Optional prefix id for style node in header
         * Returns:
         * StyleSheet object
         */
        function createStyleSheet (styleIdPrefix) {
            // Create style node in order for the document to create a styleSheet object
            var nodeId = W.Utils.getPrefixedUniqueId(styleIdPrefix);
            var ownerNode = new Element('style', {'id':nodeId}).inject(document.head);
            // Find styleSheet that was created
            var sheet = ownerNode[NODE_SHEET];

            if (!sheet) {
                var stylesheets = document.styleSheets;
                for (var i = 0; i < stylesheets.length; ++i) {
                    if (stylesheets[i][OWNER_NODE] === ownerNode) {
                        sheet = stylesheets[i];
                        break;
                    }
                }
            }

            if (sheet) {
                // Add functionality & style node reference and return sheet
                sheet._rulesMap = {};
                sheet._browserSelectorMapping = {};
                sheet.styleNode = ownerNode;
                sheet.getRuleList = getRuleList;
                sheet.removeStyleSheet = removeStyleSheet;
                sheet.clearRules = clearRules;
                sheet.getRuleBySelector = getRuleBySelector;
                sheet.removeRuleBySelector = removeRuleBySelector;
                sheet.updateRule = updateRule;
                sheet.createRule = createRule;

                ownerNode.getStyleSheet = getStyleSheet;
                return sheet;
            }

            // If no stylesheet was found throw error
            LOG.reportError(wixErrors.UTILS_ERR_CREATE_STYLE, "Styles", "createStyleSheet", "");
        }

        return ({
            createStyleSheet: function(styleIdPrefix) {
                return this._styles.createStyleSheet(styleIdPrefix);
            },
            _styles: {
                createStyleSheet:createStyleSheet
            }
        });
    });



})();