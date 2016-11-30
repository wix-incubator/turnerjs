define(['core', 'testUtils', 'lodash', 'definition!components/components/flashComponent/flashComponent', 'reactDOM', 'utils', 'imageClientApi', 'swfobject'
], function(core, testUtils, _, FlashComponentDef, ReactDOM, utils, imageClientApi) {
    'use strict';

    var flashComponent;
    var swfobject = window.swfobject; //note: this is because of eslint... if window is a problem, we can turn off eslint for the test
    function createComponentProps() {
        var siteData = testUtils.mockFactory.mockSiteData();
        var imageData = {
            "type": "Image",
            "id": "c_placeHolderImage11du",
            "uri": "e774e76ebcdb45a4b006f52149627cdb.jpg",
            "width": 1290,
            "height": 1290
        };

        var props = testUtils.mockFactory.mockProps(siteData)
            .setCompData({
                uri: 'eac6f4_e57d8bb4868848a09a7e2553883d25c3.swf',
                link: siteData.mock.pageLinkData({pageId: '#13w9'}),
                placeHolderImage: siteData.mock.imageData(imageData)
            })
            .setCompProp({
                displayMode: 'stretch'
            })
            .setNodeStyle({
                width: 250,
                height: 500
            })
            .setSkin('wysiwyg.viewer.skins.FlashComponentSkin');
        props.structure.componentType = 'wysiwyg.viewer.components.FlashComponent';

        return props;
    }

    function initCompDef() {
        flashComponent = new FlashComponentDef(_, ReactDOM, core, utils, imageClientApi, swfobject);
    }

    function getComponentFromDefinition(props) {
        return testUtils.getComponentFromDefinition(flashComponent, props);
    }

    //var skinProps;

    describe('flashComponent', function () {
        beforeEach(function () {
            initCompDef();
        });

        it('check onSWFEmbedded callback on success', function() {
            spyOn(swfobject, 'embedSWF').and.callFake(function() {
                var callback = _.last(arguments);
                callback({success: true});
            });
            var comp = getComponentFromDefinition(createComponentProps());
            expect(ReactDOM.findDOMNode(comp.refs.noFlashImgContainer).style.display).toBe('none');
        });

        describe('SWFObject functionality', function() {
            beforeEach(function() {
                spyOn(utils.guidUtils, 'getUniqueId').and.callFake(function () {
                    return '1234';
                });
                spyOn(swfobject, 'embedSWF');
                var props = createComponentProps();
                props.id = '1234';
                getComponentFromDefinition(props);
            });

            it('Should call embedSWF', function() {
               expect(swfobject.embedSWF).toHaveBeenCalled();
            });

            var embedSWFArgs;

            describe('embedSWF parameters', function(){
                beforeEach(function() {
                    embedSWFArgs = swfobject.embedSWF.calls.mostRecent().args;
                });

                it('Should check url', function() {
                    expect(embedSWFArgs[0]).toBe('root/media/eac6f4_e57d8bb4868848a09a7e2553883d25c3.swf');
                });

                it('Should check embedDivID', function() {
                    expect(embedSWFArgs[1]).toBe('1234flashContainer');
                });

                it('Should check width', function() {
                    expect(embedSWFArgs[2]).toBe('100%');
                });

                it('Should check height', function() {
                    expect(embedSWFArgs[3]).toBe('100%');
                });

                it('Should check version', function() {
                    expect(embedSWFArgs[4]).toBe('10.0.0');
                });

                it('Should check expressInstallSwfurl', function() {
                    expect(embedSWFArgs[5]).toBe('playerProductInstall.swf');
                });

                it('Should check flashvars', function() {
                    expect(embedSWFArgs[6]).toBe(null);
                });

                it('Should check params', function() {
                    var params = {
                        quality: 'high',
                        bgcolor: '#FAFAFA',
                        allowscriptaccess: 'never',
                        allowfullscreen: 'true',
                        wMode: 'transparent',
                        scale: 'exactFit',
                        flashVars: '',
                        play: 'true',
                        autoplay: 'true'
                    };

                    expect(embedSWFArgs[7]).toEqual(params);
                });

                it('Should check attributes', function() {
                    var atr = {align: 'middle'};
                    expect(embedSWFArgs[8]).toEqual(atr);
                });
            });
        });
    });
});
