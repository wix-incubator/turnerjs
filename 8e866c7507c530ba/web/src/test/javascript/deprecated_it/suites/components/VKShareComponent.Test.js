testRequire().classes('wysiwyg.deployment.it.editor.ComponentsDriver');

beforeEach(function () {
    window.editor = window.editor || new this.ComponentsDriver();
});

describe('VK Share Tests', function(){
    it('should pass', function(){
        expect(1).toBe(1);
    });
});