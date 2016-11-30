/**
 * Created by IntelliJ IDEA.
 * User: Idoro
 * Date: 08/02/11
 * Time: 17:38
 * To change this template use File | Settings | File Templates.
 */
describe('utils.styles', function() {
    it('style methods exists and valid', function() {
		expect(W.Utils).toBeDefined();
        expect(W.Utils.createStyleSheet).toBeInstanceOf(Function);
	});

    it('createStyleSheet should return a styleSheet object that correspond to a style node in the head and check remove functionality', function() {
        var styleSheet = W.Utils.createStyleSheet('prefix');
        var styleNodeName = styleSheet.styleNode.get('id');
        var styleNode = $(styleNodeName);
        expect(styleSheet).toBeDefined();
        expect(styleNode).toBeDefined();
        expect(styleSheet.styleNode).toBe(styleNode);
        expect(styleSheet.removeStyleSheet).toBeInstanceOf(Function);
        styleSheet.removeStyleSheet();
        styleNode = $(styleNodeName);
        expect(styleNode).toBe(null);
    });

    it('createRule should return a styleRule object and add it to the stylesheet', function() {
        var styleSheet = W.Utils.createStyleSheet('prefix');
        var styleRule = styleSheet.createRule('#notReal', 'color:red; text-size:10px;');
        var ruleList = styleSheet.getRuleList();
        expect(styleRule).toBeDefined();
        expect(ruleList).toBeOfType('collection');
        expect(ruleList.length).toBe(1);
        styleSheet.removeStyleSheet();
    });

    it('createRule should not add rule twice', function() {
        var styleSheet = W.Utils.createStyleSheet('prefix');
        styleSheet.createRule('#notReal', 'color:red; text-size:10px;');
        var ruleList = styleSheet.getRuleList();
        expect(ruleList.length).toBe(1);
        expect(function(){
            styleSheet.createRule('#notReal', '');
        }.bind(this)).toReportError(wixErrors.UTILS_RULE_ALREADY_EXIST, "Styles", "createRule");
        expect(styleSheet.getRuleList().length).toBe(1);
        styleSheet.removeStyleSheet();
    });

    it('styleSheet.clearRules should allow clear of all rules', function() {
        var styleSheet = W.Utils.createStyleSheet('prefix');
        styleSheet.createRule('#notReal', 'color:red; text-size:10px;');
        styleSheet.createRule('#notReal2', 'color:blue; text-size:10px;');
        expect(styleSheet.getRuleList().length).toBe(2);
        styleSheet.clearRules();
        expect(styleSheet.getRuleList().length).toBe(0);
        styleSheet.removeStyleSheet();
    });

    it('styleSheet.getRuleBySelector should return rules by selector', function() {
        var styleSheet = W.Utils.createStyleSheet('prefix');
        styleSheet.createRule('#notReal', 'color:yellow;');
        var rule = styleSheet.getRuleBySelector('#notReal');
        var noRule = styleSheet.getRuleBySelector('#notExistRule');
        expect(rule).toBeDefined();
        expect(noRule).toBe(null);
        styleSheet.removeStyleSheet();
    });

    it('styleSheet.removeRuleBySelector should remove rules by selector', function() {
        var styleSheet = W.Utils.createStyleSheet('prefix');
        styleSheet.createRule('#notReal', 'color:yellow;');
        var rule = styleSheet.getRuleBySelector('#notReal');
        expect(rule).toBeDefined();
        expect(styleSheet.removeRuleBySelector('#notReal')).toBeTruthy();
        rule = styleSheet.getRuleBySelector('#notReal');
        expect(rule).toBe(null);
        expect(styleSheet.removeRuleBySelector('#notReal')).toBeFalsy();
        styleSheet.removeStyleSheet();
    });

    it('styleSheet.updateRule should create a rule if not found', function() {
        var styleSheet = W.Utils.createStyleSheet('prefix');
        var styleRule = styleSheet.updateRule('#notReal', 'color:red; text-size:10px;');
        expect(styleSheet.getRuleList().length).toBe(1);
        styleSheet.removeStyleSheet();
    });

    it('styleSheet.updateRule should update a rule', function() {
        var styleSheet = W.Utils.createStyleSheet('prefix');
        var styleRule = styleSheet.createRule('#notReal', 'color:#ff0000; ');
        var ruleCss = styleRule.style.cssText.toLowerCase();
        expect(ruleCss.indexOf('#ff0000') || ruleCss.indexOf('(255, 0, 0)')).toBeTruthy();
        expect(styleSheet.getRuleList().length).toBe(1);
        styleRule = styleSheet.updateRule('#notReal', 'color:#ffffff;');
        ruleCss = styleRule.style.cssText.toLowerCase();
        expect(ruleCss.indexOf('#ffffff') || ruleCss.indexOf('(255, 255, 255)')).toBeTruthy();
        expect(styleRule.style.cssText.toLowerCase().indexOf('#ff0000')).toBe(-1);
        expect(styleSheet.getRuleList().length).toBe(1);
        styleSheet.removeStyleSheet();
    });
});
