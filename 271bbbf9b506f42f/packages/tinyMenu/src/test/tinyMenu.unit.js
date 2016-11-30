define(['lodash',
    'reactDOM',
    'react',
    'tinyMenu/components/tinyMenuItem'
], function
    (_, ReactDOM, React, TinyMenuItem) {
    'use strict';
    var ReactTestUtils = React.addons.TestUtils;
    var nextID = 0;

    function renderTinyMenuItem(item, options, current) {
        options = options || {};
        options.styleId = 'tst';
        return ReactTestUtils.renderIntoDocument(React.createElement(TinyMenuItem, {menuItem: item, options: options, current: current}));
    }
    function renderTinyMenuItems(items, options) {
        options = options || {};
        options.styleId = 'tst';
        return ReactTestUtils.renderIntoDocument(React.DOM.ul({
            children: TinyMenuItem.buildChildren(items, options)
        }));
    }

    function createSimpleMenuItem(label, href, items) {
        label = label || "";
        href = href || "#";
        return {
            label: React.DOM.p(null, label),
            link: {render: {href: href}},
            items: items,
            isVisibleMobile: true,
            id: ++nextID
        };
    }

    function createSubmenuHeader(items) {
        return createSimpleMenuItem("header", "#", items);
    }

    function createMenuItemWithPageLink(page, label, href, items) {
        var p = createSimpleMenuItem(label, href, items);
        p.link.type = "PageLink";
        p.link.pageId = {id: page};
        return p;
    }

    function createMenuItemWithAnchorLink(anchor, label, href, items) {
        var p = createSimpleMenuItem(label, href, items);
        p.link.type = "AnchorLink";
        p.link.anchorDataId = {id: anchor};
        return p;
    }

    describe("TinyMenuItem", function() {
        it("should render a single item with a link and a label", function() {
            var component = renderTinyMenuItem(createSimpleMenuItem("myLabel", "#someLink"));
            var anchor = _.first(ReactTestUtils.scryRenderedDOMComponentsWithTag(component, 'a'));
            var domNode = ReactDOM.findDOMNode(component);
            expect(domNode.className).toEqual("tst_item");
            expect(anchor.getAttribute("href")).toEqual("#someLink");
            var p = domNode.getElementsByTagName("p");
            expect(p.length).toEqual(1);
            expect(p[0].innerHTML).toEqual("myLabel");
        });

        it("should render a selected item with a link and a label", function() {
            var component = renderTinyMenuItem(createSimpleMenuItem(), {}, true);
            var anchor = _.first(ReactTestUtils.scryRenderedDOMComponentsWithTag(component, 'a'));
            expect(anchor.className).toEqual("tst_link tst_current");
        });

        it("should render a list of items. none should be selected", function() {
            var component = renderTinyMenuItems([
                createSimpleMenuItem(),
                createSimpleMenuItem(),
                createSimpleMenuItem()
            ]);

            var anchors = component.getElementsByClassName('tst_link');
            expect(anchors.length).toEqual(3);
            expect(_.map(anchors, "className")).toEqual(['tst_link', 'tst_link', 'tst_link']);
        });

        it("should filter out non-mobile links", function() {
            var nonMobileItem = createSimpleMenuItem();
            nonMobileItem.isVisibleMobile = false;
            var component = renderTinyMenuItems([
                createSimpleMenuItem(),
                nonMobileItem,
                createSimpleMenuItem()
            ]);

            var anchors = component.getElementsByClassName('tst_link');
            expect(anchors.length).toEqual(2);
        });

        it("should render a list of items, one of them with the current page. Only that one should be selected", function() {
            var component = renderTinyMenuItems([
                createSimpleMenuItem(),
                createMenuItemWithPageLink("somePage"),
                createMenuItemWithPageLink("someOtherPage")
            ], {
                currentPage: "somePage"
            });

            var anchors = component.getElementsByClassName('tst_link');
            expect(anchors.length).toEqual(3);
            expect(anchors[0].className).toEqual('tst_link');
            expect(anchors[1].className).toEqual('tst_link tst_current');
            expect(anchors[2].className).toEqual('tst_link');
        });

        it("should render the anchor link as selected (and not the page link) when there is a page link at the same level", function() {
            var component = renderTinyMenuItems([
                createSimpleMenuItem(),
                createMenuItemWithPageLink("somePage"),
                createMenuItemWithAnchorLink("someAnchor")
            ], {
                currentPage: "somePage",
                currentAnchor: "someAnchor"
            });

            var anchors = component.getElementsByClassName('tst_link');
            expect(anchors.length).toEqual(3);
            expect(anchors[0].className).toEqual('tst_link');
            expect(anchors[1].className).toEqual('tst_link');
            expect(anchors[2].className).toEqual('tst_link tst_current');
        });

        it("should render both the anchor link and the page link when they are at a different level", function() {
            var component = renderTinyMenuItems([
                createSimpleMenuItem(),
                createMenuItemWithPageLink("somePage"),
                createSubmenuHeader([
                    createMenuItemWithAnchorLink("someAnchor")
                ])
            ], {
                currentPage: "somePage",
                currentAnchor: "someAnchor"
            });

            var anchors = component.getElementsByClassName('tst_link');
            expect(anchors.length).toEqual(4);
            expect(_.map(anchors, "className")).toEqual(['tst_link', 'tst_link tst_current', 'tst_link', 'tst_link tst_current']);
        });

        it("should render a page link at the second level", function() {
            var component = renderTinyMenuItems([
                createSimpleMenuItem(),
                createMenuItemWithPageLink("somePage"),
                createSubmenuHeader([
                    createMenuItemWithPageLink("somePage")
                ])
            ], {
                currentPage: "somePage",
                currentAnchor: "someAnchor"
            });

            var anchors = component.getElementsByClassName('tst_link');
            expect(anchors.length).toEqual(4);
            expect(_.map(anchors, "className")).toEqual(['tst_link', 'tst_link tst_current', 'tst_link', 'tst_link tst_current']);
        });

        it("should call the onClick callback when clicked", function() {
            var harness = {
                onClick: function() { }
            };
            var onClick = spyOn(harness, "onClick");
            var component = renderTinyMenuItem(createSimpleMenuItem(), {clickCallback: harness.onClick});
            var anchor = _.first(ReactTestUtils.scryRenderedDOMComponentsWithTag(component, 'a'));
            ReactTestUtils.Simulate.click(anchor);
            expect(onClick).toHaveBeenCalled();
        });

        it("should not call the onClick callback when opening/closing a submenu", function() {
            var called = false;
            var harness = {
                onClick: function() { called = true; }
            };
            var component = renderTinyMenuItems([
                createSubmenuHeader([
                    createMenuItemWithPageLink("somePage")
                ])
            ], {clickCallback: harness.onClick});
            var anchors = component.getElementsByClassName('tst_link');
            expect(anchors.length).toEqual(2);
            ReactTestUtils.Simulate.click(anchors[0]);
            expect(called).toBeFalsy();
        });
    });
});
