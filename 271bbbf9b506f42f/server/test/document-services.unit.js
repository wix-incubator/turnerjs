'use strict';
var _ = require('lodash');
describe('test document-services server wrapper', function () {

    const TEST_FLAGS = {
        COLORS: true,
        HOME_PAGE: true,
        PAGES_DATA: true,
        FONTS: true,
        SPECIFIC_COMPS: [
            {
                pageId: 'jfehq',
                compId: 'comp-ihxeetea'
            }
        ],
        IS_PUBLISHED: true,
        URL_FORMAT: true,
        FILTERED_COMPS: [
            {
                page: {appPageId: '7326bfbb-4b10-4a8e-84c1-73f776051e10'},
                comp: {data: {appPartName: 'ea63bc0f-c09f-470c-ac9e-2a408b499f22'}}
            }
        ]
    };

    const TESTS_GETTERS = {
        COLORS: [['COLORS', 'color_3', '#ED1C24']],
        SPECIFIC_COMPS: [['SPECIFIC_COMPS.0.data.label', 'View Map >']],
        HOME_PAGE: [['HOME_PAGE', 'c1dmp']],
        PAGES_DATA: [['PAGES_DATA', {id: 'jfehq'}, 'title', 'CONTACT']],
        URL_FORMAT: [['URL_FORMAT', 'hashBang']],
        FONTS: [['FONTS', 'font_1', 'normal normal normal 16px/1.4em din-next-w01-light {color_14}']],
        IS_PUBLISHED: [['IS_PUBLISHED', true]],
        FILTERED_COMPS: [
            ['FILTERED_COMPS.0.data.viewName', 'SinglePostMediaTop'],
            ['FILTERED_COMPS.0.layout.width', 670]
        ]
    };

    const TESTS_ONLY_EDITOR = ['PAGES_DATA', 'IS_PUBLISHED'];

    // fetching from blog page fails in public models ['spqaw', 'comp-iff59kjo']
    // need to fix blog data loading to work server side

    beforeAll(function (done) {
        this.documentServices = require('../main/document-services');
        var santaTestkit = require('wix-santa-testkit');
        this.staticsServer = santaTestkit.getStaticsServer();
        this.staticsServer.start().then(done);
        this.getEditorModels = santaTestkit.getEditorModels;
        this.getPublicModels = santaTestkit.getPublicModels.bind(null, this.staticsServer);
    });

    afterAll(function (done) {
        this.staticsServer.stop().then(done);
    });

    function assertResults(result, flagTests) {
        _.forEach(flagTests, (matchers) => {
            const expectedValue = matchers.pop();
            const actualValue = _.reduce(matchers, (acc, nextStep) => {
                return _.isPlainObject(nextStep) ? _.find(acc, nextStep) : _.get(acc, nextStep);
            }, result);
            expect(actualValue).toEqual(expectedValue);
        });
    }


    describe('fetching data from publicModels', function () {
        const testFlags = _.omit(TEST_FLAGS, TESTS_ONLY_EDITOR);
        const testGetters = _.pick(TESTS_GETTERS, _.keys(testFlags));
        beforeAll(function (done) {
            this.documentServices.readFromPublicModel(this.getPublicModels(), testFlags)
            .then((res) => {
                this.result = res;
                done();
            }).catch((e) => {
                console.log('error', e.toString(), e.stack);
            });
        });
        _.forEach(testGetters, (flagTests, flagName) => {
            it(`fetching data from publicModels, should fetch ${flagName}`, function () {
                assertResults(this.result, _.cloneDeep(flagTests));
            });
        });
    });


    describe('fetching data from editorModels', function () {
        const testFlags = TEST_FLAGS;
        const testGetters = TESTS_GETTERS;
        beforeAll(function () {
            this.result = this.documentServices.readFromEditorModel(this.getEditorModels(), testFlags);
        });
        _.forEach(testGetters, (flagTests, flagName) => {
            it(`fetching data from editorModels, should fetch ${flagName}`, function () {
                assertResults(this.result, _.cloneDeep(flagTests));
            });
        });
    });

});

