/**
 * Created with IntelliJ IDEA.
 * User: dw
 * Date: 2/7/13
 * Time: 1:05 PM
 * To change this template use File | Settings | File Templates.
 */
describe('WComponentSerializer', function () {
    it('should always have tests', function () {
        expect(1===1).toBeTruthy();
    });

    testRequire().
        resources('W.Data', 'W.Components', 'W.CompSerializer');

    describeExperiment({ValidateComponent: "New"}, "ValidateComponent", function () {
        beforeEach(function () {

            // component info
            var compInfo = {
                name: 'core.components.Button',
                skin: 'mock.skins.ButtonSkin',
                dataQuery: null,
                args: {label: "some label"}
            };

            var compInfoGreen = {
                name: 'core.components.Button',
                skin: 'mock.skins.ButtonSkin',
                dataQuery: null,
                args: {label: "some label Green"}
            };


            // mock data
            this.W.Data.addDataItems({
                "btnData": {
                    "label": "some label"
                }
            });

            this.W.Data.addDataItems({
                "btnDataGreen": {
                    "label": "some label Green"
                }
            });

            runs(function () {
                this.checked = {};
                this.compNode = this.W.Components.createComponent(compInfo.name, compInfo.skin, compInfo.dataQuery, compInfo.args, null /* wixify */, function (logic) {
                    this.checked.red = true;
                }.bind(this));

                this.compNodeGreen = this.W.Components.createComponent(compInfoGreen.name, compInfoGreen.skin, compInfoGreen.dataQuery, compInfoGreen.args, null /* wixify */, function (logic) {
                    this.checked.green = true;
                }.bind(this));
            });

            waitsFor(function () {
                return (this.checked.green && this.checked.red);
            }.bind(this), 'waits for component to be ready', 100);


        });

        beforeEach(function () {
            spyOn(this.W.CompSerializer, 'serializeComponent').andReturn('fake serialized');
        });

        describe('serializeComponents for component without logic', function () {
            beforeEach(function () {
                this.compNode.getLogic = function () {
                    return undefined;
                };
            });

            it("should remove component from result", function () {
                var serializedComponents = this.W.CompSerializer.serializeComponents([this.compNode, this.compNodeGreen])
                expect(serializedComponents.length == 1);
            });

            it("should send an error for each component", function () {
                spyOn(LOG, 'reportError');
                this.W.CompSerializer.serializeComponents([this.compNode, this.compNodeGreen])
                expect(LOG.reportError).toHaveBeenCalledWithFollowingPartialArguments(wixErrors.FAILED_COMPONENT_SERIALIZATION);
            });
        });


        // spec files because of test-system and mocks limitation
        // since Ido states that it's not a realy possible case of error - screw this test
        describe('serializeComponents for component without view', function () {
            beforeEach(function () {
                spyOn(this.compNode.$logic, 'getViewNode').andCallFake(function (args, callback) {
                    return undefined;
                });
            });

            it("should remove component from result", function () {
                var serializedComponents = this.W.CompSerializer.serializeComponents([this.compNode, this.compNodeGreen]);
                expect(serializedComponents.length == 1);
            });

            it("should send an error for each component", function () {
                spyOn(LOG, 'reportError');
                this.W.CompSerializer.serializeComponents([this.compNode, this.compNodeGreen])
                expect(LOG.reportError).toHaveBeenCalledWithFollowingPartialArguments(wixErrors.FAILED_COMPONENT_SERIALIZATION);
            });
        });

    });

    describe("Lazy serialization", function(){
        describe("test serializeComponents for component that hasn't been wixified", function(){
            beforeEach(function(){
                this.wixifiedCompNode = new Element('div');
                this.wixifiedCompNode.$logic = {};
                this.NotWixifiedcompNode = new Element('div');
                spyOn(this.W.CompSerializer, '_validateComponent').andReturn(true);
            });

            it("should not serialize this.NotWixifiedcompNode", function() {
                var serializedComponents = this.W.CompSerializer.serializeComponents([this.wixifiedCompNode, this.NotWixifiedcompNode]);
                expect(serializedComponents.length == 1);
            });
            it("should not send an error for this.NotWixifiedcompNode", function(){
                spyOn(LOG, 'reportError');
                this.W.CompSerializer.serializeComponents([this.wixifiedCompNode, this.NotWixifiedcompNode]);
                expect(LOG.reportError).not.toHaveBeenCalled();
            });
        });
    });
});