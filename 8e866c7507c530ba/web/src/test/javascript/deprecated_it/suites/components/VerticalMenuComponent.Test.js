testRequire().classes('wysiwyg.deployment.it.editor.ComponentsDriver');

beforeEach(function () {
    window.editor = window.editor || new this.ComponentsDriver();
});

describe('Vertical Menu Tests', function(){
    var menuComponent,
        compPreset = {
            "compType": "wysiwyg.common.components.verticalmenu.viewer.VerticalMenu",
            "layout": {
                "width": 100,
                "height": 400
            },
            "styleId": 1
        },
        $ = document.querySelectorAll.bind(document);

    beforeEach(function () {
        editor
            .removeComponent(menuComponent)
            .then(function () {
                return editor.createCompFactoryComponent(compPreset);
            })
            .then(function (component) {
                menuComponent = component;

                //Move it left so it won't be hidden by the settings panel
                editor.dragComponent(menuComponent, { y: 0, x: 350 });
            });

        //Close report
        setTimeout(function () {
            $('#HTMLReporter')[0].style.display = 'none';
        }, 100);
    });


    it('should pass', function(){
        expect(1).toBe(1);
    });
});