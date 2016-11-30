define(['lodash', 'testUtils', 'components/components/verticalMenu/verticalMenuDomBuilder'], function (_, testUtils, domBuilder) {
    'use strict';

    describe('verticalMenuDomBuilder', function () {

        var siteData, mockSiteData;
        beforeEach(function() {
            if (!siteData) {
              siteData = testUtils.mockFactory.mockSiteData();
                mockSiteData = [
                    siteData.mock.menuItemData({
                        label: 'Page 4', link: siteData.mock.pageLinkData(), items: [
                            siteData.mock.menuItemData({label: 'Contact', link: siteData.mock.pageLinkData()})
                        ]
                    }),
                    siteData.mock.menuItemData({
                        label: 'Header', items: [
                            siteData.mock.menuItemData({label: 'Scroll to Bottom', link: siteData.mock.externalLinkData()}),
                            siteData.mock.menuItemData({label: 'Web Address', link: siteData.mock.externalLinkData()})
                        ]
                    }),
                    siteData.mock.menuItemData({label: 'Email', link: siteData.mock.pageLinkData()})
                ];
            }
        });

        var mockSkins = {
                mockSkinName: {
                    react: [
                        [
                            "ul",
                            "menuContainer",
                            [],
                            [
                                "li",
                                "menuItem",
                                ["_item"],
                                [
                                    "div",
                                    null,
                                    ["_itemContentWrapper"],
                                    [
                                        "a",
                                        null,
                                        []
                                    ],
                                    [
                                        "ul",
                                        null,
                                        ["_subMenu"]
                                    ]
                                ],
                                [
                                    "div",
                                    null,
                                    ["_separator"]
                                ]
                            ]
                        ]
                    ]
                }
            },
            mockClassPrefix = 'mockClassPrefix',
            mockHeights = {
                separator: 10,
                line: 20
            };

        function extractProps(data) {
            var children = [];

            if (!data.props) {
                return data;
            }

            if (_.isArray(data.props.children)) {
                _.forEach(data.props.children, function (childData) {
                    children.push(extractProps(childData));
                });
            } else if (data.type === 'a') {
                children.push(data.props.children);
            }


            return {
                children: children,
                className: data.props.className
            };
        }

        describe('getSkin', function () {

            beforeEach(function () {
                this.skin = domBuilder.getSkin(mockSkins, 'mockSkinName');
            });

            it('should return skin object from skin map', function () {
                expect(this.skin).toEqual(mockSkins.mockSkinName);
            });

            describe('buildTemplate', function () {

                beforeEach(function () {
                    this.template = domBuilder.buildTemplate(this.skin.react[0], mockClassPrefix);
                });

                it('should return template object', function () {
                    var expected = {tag: 'ul', skinPart: 'menuContainer', className: [], items: [
                        {tag: 'li', skinPart: 'menuItem', className: ['mockClassPrefix_item'], items: [
                            {tag: 'div', skinPart: null, className: ['mockClassPrefix_itemContentWrapper'], items: [
                                {tag: 'a', skinPart: null, className: [], items: []},
                                {tag: 'ul', skinPart: null, className: ['mockClassPrefix_subMenu'], items: []}
                            ]},
                            {tag: 'div', skinPart: null, className: ['mockClassPrefix_separator'], items: []}
                        ]}
                    ]};

                    expect(this.template).toEqual(expected);
                });

                describe('buildDOMFromTemplate', function () {

                    beforeEach(function () {
                        this.dom = domBuilder.buildDOMFromTemplate(this.template, mockSiteData, mockClassPrefix, '', mockHeights, '', {}, true, {});
                    });

                    it('should return DOM with correct structure', function () {
                        var expected = {children: [
                                {children: [
                                    {children: [
                                        {children: ['Page 4'], className: ' mockClassPrefix_label level0'},
                                        {children: [
                                            {children: [
                                                {children: [
                                                    {children: ['Contact'], className: ' mockClassPrefix_label level1'},
                                                    {children: [], className: 'mockClassPrefix_subMenu  mockClassPrefix_emptySubMenu'}
                                                ], className: 'mockClassPrefix_itemContentWrapper '},
                                                {children: [], className: 'mockClassPrefix_separator '}
                                            ], className: 'mockClassPrefix_item '}
                                        ], className: 'mockClassPrefix_subMenu '}
                                    ], className: 'mockClassPrefix_itemContentWrapper '},
                                    {children: [], className: 'mockClassPrefix_separator '}
                                ], className: 'mockClassPrefix_item '},
                                {children: [
                                    {children: [
                                        {children: ['Header'], className: 'mockClassPrefix_noLink mockClassPrefix_label level0'},
                                        {children: [
                                            {children: [
                                                {children: [
                                                    {children: ['Scroll to Bottom'], className: ' mockClassPrefix_label level1'},
                                                    {children: [], className: 'mockClassPrefix_subMenu  mockClassPrefix_emptySubMenu'}
                                                ], className: 'mockClassPrefix_itemContentWrapper '},
                                                {children: [], className: 'mockClassPrefix_separator '}
                                            ], className: 'mockClassPrefix_item '},
                                            {children: [
                                                {children: [
                                                    {children: ['Web Address'], className: ' mockClassPrefix_label level1'},
                                                    {children: [], className: 'mockClassPrefix_subMenu  mockClassPrefix_emptySubMenu'}
                                                ], className: 'mockClassPrefix_itemContentWrapper '},
                                                {children: [], className: 'mockClassPrefix_separator '}
                                            ], className: 'mockClassPrefix_item '}
                                        ], className: 'mockClassPrefix_subMenu mockClassPrefix_noLink'}
                                    ], className: 'mockClassPrefix_itemContentWrapper mockClassPrefix_noLink'},
                                    {children: [], className: 'mockClassPrefix_separator mockClassPrefix_noLink'}
                                ], className: 'mockClassPrefix_item mockClassPrefix_noLink'},
                                {children: [
                                    {children: [
                                        {children: ['Email'], className: ' mockClassPrefix_label level0'},
                                        {children: [], className: 'mockClassPrefix_subMenu  mockClassPrefix_emptySubMenu'}
                                    ], className: 'mockClassPrefix_itemContentWrapper '},
                                    {children: [], className: 'mockClassPrefix_separator '}
                                ], className: 'mockClassPrefix_item '}
                            ], className: 'mockClassPrefixmenuContainer'},
                            calculated = extractProps(this.dom);

                        expect(calculated).toEqual(expected);
                    });
                });
            });
        });
    });
});
