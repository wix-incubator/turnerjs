/**
 * Created by avim on 05/10/2016.
 */
'use strict';
var reactDOM = require('react-dom/server');
var _ = require('lodash');
var browserGlobalsSafety = require('./helpers/browserGlobalsSafety');

describe('test server side render', function () {

    beforeAll(function (done) {
        this.santaRequire = require('../main/common/node-santa-require')({context: 'RENDER_UNIT'});
        this.render = require('../main/render')(this.santaRequire);
        var santaTestkit = require('wix-santa-testkit');
        this.staticsServer = santaTestkit.getStaticsServer();
        this.staticsServer.start().then(done);
        this.getPublicModels = santaTestkit.getPublicModels.bind(null, this.staticsServer);
        this.getEditorModels = santaTestkit.getEditorModels;
    });

    afterAll(function (done) {
        this.staticsServer.stop().then(done);
    });

    describe('basic rendering', function () {
        it('should render the home page without dead comps', function (done) {
            const siteModel = this.getPublicModels();

            siteModel.requestModel = {
                userAgent: 'Some chrome thingy',
                cookie: null,
                storage: {}
            };
            siteModel.currentUrl = siteModel.publicModel.externalBaseUrl;

            this.render(siteModel, (site) => {
                const html = reactDOM.renderToString(site);
                expect(html).toContain('MY CART');
                expect(html).not.toContain('data-dead-comp="true"');
                done();
            });
        });
        it('should support rendering with alt ajax handlers', function (done) {
            const siteModel = this.getPublicModels();
            const editorModel = this.getEditorModels();
            const httpUtils = require('../main/common/httpUtils');

            siteModel.requestModel = {
                userAgent: 'Some chrome thingy',
                cookie: null,
                storage: {}
            };
            siteModel.currentUrl = siteModel.publicModel.externalBaseUrl;

            function readPageJSONsFromEditorModelsFirst(reqFlags, siteData) {
                var url = reqFlags.url;
                if (url.indexOf(siteModel.publicModel.pageList.masterPageJsonFileName) !== -1) {
                    return Promise.resolve(editorModel.siteAsJson.masterPage);
                }
                var pageMatched = _.find(siteModel.publicModel.pageList.pages, function (page) {
                    return url.indexOf(page.pageJsonFileName) !== -1;
                });
                if (pageMatched) {
                    var pageJson = _.find(editorModel.siteAsJson.pages, {structure: {id: pageMatched.pageId}});
                    if (pageJson) {
                        return Promise.resolve(pageJson);
                    }
                }
                return httpUtils.ajaxDefaultHandler(reqFlags, siteData);
            }

            this.render(siteModel, (site) => {
                const html = reactDOM.renderToString(site);
                expect(html).toContain('MY CART');
                expect(html).not.toContain('data-dead-comp="true"');
                done();
            }, null, readPageJSONsFromEditorModelsFirst);
        });
    });

    describe('components rendering', function () {
        var componentsToTest = ['wysiwyg.viewer.components.FiveGridLine',
            'wysiwyg.viewer.components.VerticalLine',
            'wysiwyg.common.components.anchor.viewer.Anchor',
            //'core.components.Image',
            //'core.components.ZoomedImage',
            'wysiwyg.viewer.components.AdminLoginButton',
            'wysiwyg.common.components.imagebutton.viewer.ImageButton',
            'wixapps.integration.components.Area',
            'wysiwyg.viewer.components.VerticalRepeater',
            'wysiwyg.viewer.components.WSiteStructure',
            'mobile.core.components.Container',
            'wixapps.integration.components.AppPage',
            'wysiwyg.viewer.components.HeaderContainer',
            'wysiwyg.viewer.components.FooterContainer',
            'wysiwyg.viewer.components.PagesContainer',
            'wysiwyg.viewer.components.ScreenWidthContainer',
            'wysiwyg.viewer.components.ClipArt',
            'wysiwyg.viewer.components.Displayer',
            'wysiwyg.viewer.components.GoogleMap',
            //'wysiwyg.viewer.components.LinkBar',
            'wysiwyg.viewer.components.LinkBarItem',
            //'wysiwyg.viewer.components.MatrixGallery',
            //'wysiwyg.viewer.components.PaginatedGridGallery',
            'wysiwyg.common.components.pinitpinwidget.viewer.PinItPinWidget',
            'wysiwyg.viewer.components.SiteButton',
            'wysiwyg.viewer.components.LoginButton',
            'wixapps.integration.components.inputs.TextArea',
            'wysiwyg.viewer.components.inputs.TextAreaInput',
            'wysiwyg.viewer.components.Video',
            'wysiwyg.viewer.components.WPhoto',
            'wysiwyg.viewer.components.WRichText',
            'wysiwyg.viewer.components.SoundCloudWidget',
            'wysiwyg.viewer.components.HoverBox_old',
            'wysiwyg.viewer.components.inputs.Checkbox',
            'wysiwyg.viewer.components.inputs.RadioButton',
            'wysiwyg.viewer.components.inputs.DatePicker',
            'wysiwyg.viewer.components.inputs.RadioGroup',
            'platform.components.AppController',
            'wysiwyg.viewer.components.PopupCloseTextButton'];
        //componentsToTest = ['mobile.core.components.Container'];

        var compsDefaultProps = {};

        beforeAll(function () {
            var siteData = require('../main/common/siteDataFromModel')(this.santaRequire, _.assign({}, this.getEditorModels(), this.getPublicModels()));
            var compsRender = require('./helpers/compsRender')(this.santaRequire);
            //console.log(compsRender.santaPropTypeComponents);
            _.forEach(componentsToTest, function (compType) {
                compsDefaultProps[compType] = compsRender.getComponentProps(compType, siteData);
            });
        });

        beforeEach(function () {
            this.browsersGlobalsAbuse = browserGlobalsSafety.lockBrowserGlobalsAccess();
        });

        afterEach(function () {
            browserGlobalsSafety.unlockBrowserGlobalsAccess();
        });

        var renderingPermutations = [
            [{
                name: 'MOBILE_VIEW',
                overrides: {isMobileView: true}
            }, {
                name: 'DESKTOP_VIEW',
                overrides: {isMobileView: false}
            }],
            [{
                name: 'MOBILE_DEVICE',
                overrides: {isMobileDevice: true}
            }, {
                name: 'DESKTOP_DEVICE',
                overrides: {isMobileDevice: false}
            }],
            [{
                name: 'DEBUG',
                overrides: {isDebugMode: true}
            }, {
                name: 'NOT_DEBUG',
                overrides: {isDebugMode: false}
            }]
        ];

        var componentsToForgiveForTouchingWindow = [
            'wysiwyg.viewer.components.WPhoto',
            'wysiwyg.viewer.components.ClipArt'
        ];

        function createRenderITs(compType, title, overrides) {
            it('test ' + title + ' rendering for componentType ' + compType, function () {
                var props = _.merge({}, compsDefaultProps[compType], overrides);
                var compElement = this.santaRequire('siteUtils').compFactory.getCompClass(compType)(props);
                const html = reactDOM.renderToString(compElement);
                expect(html).not.toContain('data-dead-comp="true"');
                expect(html).toBeTruthy();
                if (!_.includes(componentsToForgiveForTouchingWindow, compType)) {
                    browserGlobalsSafety.assertBrowserGlobalsNotTouched(this.browsersGlobalsAbuse);
                }
            });
        }

        function getAllPermutations(permutationsMatrix) {
            var multiples = _.reduce(permutationsMatrix, function (acc, p) {
                acc.unshift(acc[0] * p.length);
                return acc;
            }, [1]);
            return _(multiples[0])
                .range()
                .map(function (n) {
                    return _(permutationsMatrix)
                        .map(function (p, i) {
                            return p[Math.floor(n / multiples[i + 1]) % p.length];
                        })
                        .reduce(function (acc, p) {
                            acc.title += p.name + ' ';
                            _.assign(acc.overrides, p.overrides);
                            return acc;
                        }, {title: '', overrides: {}});
                })
                .value();
        }

        _.forEach(componentsToTest, function (compType) {
            describe('test rendering ' + compType, function () {
                var permutations = getAllPermutations(renderingPermutations);
                _.forEach(permutations, function (testCase) {
                    createRenderITs(compType, testCase.title, testCase.overrides);
                });
            });
        });
    });

});

