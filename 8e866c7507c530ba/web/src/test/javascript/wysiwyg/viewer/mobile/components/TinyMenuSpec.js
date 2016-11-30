describe('TinyMenu', function() {

    testRequire()
        .classes('core.managers.components.ComponentBuilder')
        .components('wysiwyg.viewer.components.mobile.TinyMenu')
        .resources('W.Data', 'W.ComponentLifecycle', 'W.Viewer');

    beforeEach(function(){
        var componentLogicName = 'tinyMenu';
        this[componentLogicName] = null;

        this.define.dataItem('pageA', {
            'type': 'Page',
            'htmlId': 'pageA', 'uri': 'page_a_uri', 'title': 'pageA Title'
        });
        this.define.dataItem('pageA1', {
            'type': 'Page',
            'htmlId': 'pageA1', 'uri': 'page_a1_uri', 'title': 'pageA1 Title'
        });

        this.define.dataItem('pageB', {
            'type': 'Page',
            'htmlId': 'pageB', 'uri': 'page_b_uri', 'title': 'pageB Title'
        });
        this.define.dataItem('pageB1', {
            'type': 'Page',
            'htmlId': 'pageB1', 'uri': 'page_b1_uri', 'title': 'pageB1 Title'
        });
        this.define.dataItem('pageB2', {
            'type': 'Page',
            'htmlId': 'pageB2', 'uri': 'page_b1_uri', 'title': 'pageB1 Title'
        });

        this.define.dataItem('pageC', {
            'type': 'Page',
            'htmlId': 'pageC', 'uri': 'page_c_uri', 'title': 'pageC Title'
        });

        this.define.dataItem('MAIN_MENU',{
            type: 'Menu',
            items:[
                {refId:'#pageA', type:'MenuItem', items:[
                    {refId:'#pageA1', type:'MenuItem', items:[]}
                ]},
                {refId:'#pageB', type:'MenuItem', items:[
                    {refId:'#pageB1', type:'MenuItem', items:[
                        {refId:'#pageB2', type:'MenuItem', items:[]}
                    ]}
                ]},
                {refId:'#pageC', type:'MenuItem', items:[]}
            ]
        });

        this.define.dataItem('Welcome', {
            type: 'BasicMenuItem',
            label: 'Welcome',
            link: 'welcomeId',
            items: []
        });

        this.define.dataItem('Shop', {
            type: 'BasicMenuItem',
            label: 'Shop',
            link: 'shopId',
            items: []
        });

        var data = this.W.Data.getDataByQuery('#MAIN_MENU');

        this.createTinyMenuComponent = function(componentLogic){
            var builder = new this.ComponentBuilder(document.createElement('div'));

            builder
                .withType('wysiwyg.viewer.components.mobile.TinyMenu')
                .withSkin('mock.viewer.skins.TinyMenuSkin')
                .withData(data)
                ._with("htmlId", "mockId")
                .onCreated(function(createdComponent){
                    createdComponent.render();
                    this[componentLogic] = createdComponent;
                }.bind(this))
                .create();

            waitsFor(function() {
                return this[componentLogic];
            }, componentLogic + " to be ready", 1000);

            runs(function(){
                this.container = this.tinyMenu._skinParts.menuContainer;
                spyOn(this.tinyMenu, '_applyResponsiveStyling');
                this.data = this.tinyMenu._data;
            });
        };

        this.createTinyMenuComponent(componentLogicName);
    });

    afterEach(function(){
    });

    describeExperiment({CustomSiteMenu:"new"}, 'skin definition', function() {
        it('should have a menu toggle button', function(){
            var toggleButton = this.tinyMenu._skinParts.menuButton;
            expect(toggleButton).toBeDefined();
        });

        it('should have a menu container', function(){
            var menuContainer = this.tinyMenu._skinParts.menuContainer;
            expect(menuContainer).toBeDefined();
        });
    });

    xdescribeExperiment({CustomSiteMenu:"new"}, 'skin definition', function() {
        it('should have a menu toggle button', function(){
            var toggleButton = this.tinyMenu._skinParts.menuButton;
            expect(toggleButton).toBeDefined();
        });

        it('should have a menu container', function(){
            var menuContainer = this.tinyMenu._skinParts.menuContainer;
            expect(menuContainer).toBeDefined();
        });
    });

    describeExperiment({CustomSiteMenu:"new"}, 'mainMenu', function(){
        it('should run when data is presented', function(){
            var data = this.data;
            var mainMenu = this.tinyMenu._mainMenu;

            expect(data).toBeDefined();
            expect(mainMenu).toBeDefined();
            expect(mainMenu).toBeTruthy();
        });

        it('should not run when data is undefined', function(){
            var data = undefined;
            var container = this.container;

            var mainMenu = this.tinyMenu._initMenu(data, container);

            expect(data).toBeUndefined();
            expect(mainMenu).toBeUndefined();

        });

        it('should not run when data is empty', function(){
            var data = [];

            var container = this.container;
            var mainMenu = this.tinyMenu._initMenu(data, container);

            expect(data.length).toBe(0);
            expect(mainMenu).toBeUndefined();

        });
    });

    xdescribeExperiment({CustomSiteMenu:"new"}, 'mainMenu', function(){
        it('should run when data is presented', function(){
            var data = this.data;
            var mainMenu = this.tinyMenu._mainMenu;

            expect(data).toBeDefined();
            expect(mainMenu).toBeDefined();
            expect(mainMenu).toBeTruthy();
        });

        it('should not run when data is undefined', function(){
            var data = undefined;
            var container = this.container;

            var mainMenu = this.tinyMenu._initMenu(data, container);

            expect(data).toBeUndefined();
            expect(mainMenu).toBeUndefined();

        });

        it('should not run when data is empty', function(){
            var data = [];

            var container = this.container;
            var mainMenu = this.tinyMenu._initMenu(data, container);

            expect(data.length).toBe(0);
            expect(mainMenu).toBeUndefined();

        });
    });

    describeExperiment({CustomSiteMenu:"new"}, 'Items', function(){
        beforeEach(function(){
            this.data = [
                this.W.Data.getDataByQuery('#Welcome'),
                this.W.Data.getDataByQuery('#Shop')
            ];
        });

        afterEach(function(){
            this.data = undefined;
        });

        it('should be added if presented in data', function(){
            var data = this.data;
            var container = this.container;
            var menu = this.tinyMenu._buildMenu(data, container);
            var itemElements = menu.getElementsByTagName('li');

            expect(itemElements.length).toBe(2);
        });

        describe('Links', function(){
            beforeEach(function(){
                var data = this.data;
                var container = this.container;
                var menu = this.tinyMenu._buildMenu(data, container);
                var itemElements = menu.getElementsByTagName('li');
                var lastItem = itemElements[1];
                var link = lastItem.getElementsByTagName('a')[0];
                this.menu = menu;
                this.link = link;
            });

            afterEach(function(){
                this.link = undefined;
            });

            it('should have names from data', function(){
                var name = "Shop";
                var link = this.link;
                expect(link.innerHTML).toContain(name);
            });
        });
    });

    xdescribeExperiment({CustomSiteMenu:"new"}, 'Items', function(){
        beforeEach(function(){
            this.data = [
                {
                    "id": "welcomeId",
                    "name": "Welcome",
                    "children": []
                },
                {
                    "id": "shopId",
                    "name": "Shop",
                    "children": []
                }
            ];
        });

        afterEach(function(){
            this.data = undefined;
        });

        it('should be added if presented in data', function(){
            var data = this.data;
            var container = this.container;
            var menu = this.tinyMenu._buildMenu(data, container);
            var itemElements = menu.getElementsByTagName('li');

            expect(itemElements.length).toBe(2);
        });

        describe('Links', function(){
            beforeEach(function(){
                var data = this.data;
                var container = this.container;
                var menu = this.tinyMenu._buildMenu(data, container);
                var itemElements = menu.getElementsByTagName('li');
                var lastItem = itemElements[1];
                var link = lastItem.getElementsByTagName('a')[0];
                this.menu = menu;
                this.link = link;
            });

            afterEach(function(){
                this.link = undefined;
            });

            it('should have names from data', function(){
                var name = "Shop";
                var link = this.link;
                expect(link.innerHTML).toContain(name);
            });

            it('should trigger page navigation on click', function(){
                var link = this.link;
                var id = "shopId";

                spyOn(this.tinyMenu, '_navigateToPage');

                link.click();

                expect(this.tinyMenu._navigateToPage).toHaveBeenCalled();
                expect(this.tinyMenu._navigateToPage).toHaveBeenCalledWith(id);
            });

            it('should close menu on click', function(){
                var link = this.link;
                var menu = this.menu;
                var wholeMenuButton = this.tinyMenu._skinParts.menuButton;
                spyOn(this.tinyMenu, '_navigateToPage');

                wholeMenuButton.click();  //open menu
                link.click();  //close menu

                expect(wholeMenuButton.className).toNotContain('open');
                expect(menu.className).toNotContain('open');
            });

            it('should be marked as current page on click', function (){
                var link = this.link;
                var menu = this.menu;
                var id = "shopId";
                spyOn(this.tinyMenu, '_navigateToPage').andCallFake(function emulateNavigationTracking(){
                    this.tinyMenu._setCurrentPage(menu, id);
                }.bind(this));

                link.click();

                expect(link.className).toContain('tiny-menu-current-page');
            });

            //TODO: Maybe check that only one 1 link is marked as current page
        });
    });

});
