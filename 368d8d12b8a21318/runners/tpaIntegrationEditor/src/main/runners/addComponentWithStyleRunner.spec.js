define(['tpaIntegrationEditor/driver/driver', 'jasmine-boot'], function (driver) {
    'use strict';

    describe('addComponentWithStyle', function () {

        var originalTimeout;

        beforeAll(function() {
            originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
            jasmine.DEFAULT_TIMEOUT_INTERVAL = 24000;
        });

        afterAll(function() {
            jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
        });

        describe('add widget ', function () {

            beforeEach(function(){
                this.defaultStyleId = 'tpaw0';
                this.compId = 'comp-iq2azl5i';
                this.msg = {
                    compId: this.compId,
                    data: {
                        componentType: 'WIDGET',
                        widget: {
                            tpaWidgetId: 'instagram_feed',
                            allPages: false
                        }
                    }
                };
                this.defaultStyle = {};
                this.origCompStyle = driver.getStyleProperties(this.msg.compId);
                this.differentCompStyle = driver.getStyleProperties('comp-iq2ckj1h');
                this.appDefId = '12a5a563-3b69-724b-e21e-6e03d190cf72';
            });

            it('should add a comp with orig comp style when copyStyle is true ', function (done) {
                this.msg.data.copyStyle = true;

                driver.addComponent(this.appDefId, this.msg, function(compId) {
                    expect(compId).toBeDefined();
                    expect(driver.getStyleId(this.compId)).toEqual(driver.getStyleId(compId));
                    expect(driver.getStyleProperties(compId)).toEqual(this.origCompStyle);
                    done();
                }.bind(this));
            });

            it('should add a comp with specified style when copyStyle is true and styleId is valid', function (done) {
                this.msg.data.copyStyle = true;
                this.msg.data.styleId = 'style-iq2cktxa';

                driver.addComponent(this.appDefId, this.msg, function(compId) {
                    expect(compId).toBeDefined();
                    expect('style-iq2cktxa').toEqual(driver.getStyleId(compId));
                    expect(driver.getStyleProperties(compId)).toEqual(this.differentCompStyle);
                    done();
                }.bind(this));
            });

            it('should add a comp with default style when copyStyle is true and styleId is invalid', function (done) {
                this.msg.data.copyStyle = true;
                this.msg.data.styleId = 'style-1111';

                driver.addComponent(this.appDefId, this.msg, function(compId) {
                    expect(compId).toBeDefined();
                    expect(this.defaultStyleId).toEqual(driver.getStyleId(compId));
                    expect(driver.getStyleProperties(compId)).toEqual(this.defaultStyle);
                    done();
                }.bind(this));
            });

            it('should add a comp with default style when copyStyle is not passed ', function (done) {
                driver.addComponent(this.appDefId, this.msg, function(compId) {
                    expect(compId).toBeDefined();
                    expect(this.defaultStyleId).toEqual(driver.getStyleId(compId));
                    expect(driver.getStyleProperties(compId)).toEqual(this.defaultStyle);
                    done();
                }.bind(this));
            });
        });

        describe('add glued widget ', function () {

            beforeEach(function(){
                this.defaultStyleId = 'tpagw0';
                this.compId = 'comp-iq2azl5i';
                this.msg = {
                    compId: this.compId,
                    data: {
                        componentType: 'WIDGET',
                        widget: {
                            tpaWidgetId: 'back_to_top',
                            allPages: false
                        }
                    }
                };
                this.defaultStyle = {};
                this.origCompStyle = driver.getStyleProperties(this.msg.compId);
                this.differentCompStyle = driver.getStyleProperties('comp-iq2da47g');
                this.appDefId = '13a0fdb7-8f49-2cb3-c634-c9158ba38c0d';
            });

            it('should add a comp with orig comp style when copyStyle is true ', function (done) {
                this.msg.data.copyStyle = true;

                driver.addComponent(this.appDefId, this.msg, function(compId) {
                    expect(compId).toBeDefined();
                    expect(driver.getStyleId(this.compId)).toEqual(driver.getStyleId(compId));
                    expect(driver.getStyleProperties(compId)).toEqual(this.origCompStyle);
                    done();
                }.bind(this));
            });

            it('should add a comp with specified style when copyStyle is true and styleId is valid', function (done) {
                this.msg.data.copyStyle = true;
                this.msg.data.styleId = 'style-iq2dajve';

                driver.addComponent(this.appDefId, this.msg, function(compId) {
                    expect(compId).toBeDefined();
                    expect('style-iq2dajve').toEqual(driver.getStyleId(compId));
                    expect(driver.getStyleProperties(compId)).toEqual(this.differentCompStyle);
                    done();
                }.bind(this));
            });

            it('should add a comp with default style when copyStyle is true and styleId is invalid', function (done) {
                this.msg.data.copyStyle = true;
                this.msg.data.styleId = 'style-1111';

                driver.addComponent(this.appDefId, this.msg, function(compId) {
                    expect(compId).toBeDefined();
                    expect(this.defaultStyleId).toEqual(driver.getStyleId(compId));
                    expect(driver.getStyleProperties(compId)).toEqual(this.defaultStyle);
                    done();
                }.bind(this));
            });

            it('should add a comp with default style when copyStyle is not passed ', function (done) {
                driver.addComponent(this.appDefId, this.msg, function(compId) {
                    expect(compId).toBeDefined();
                    expect(this.defaultStyleId).toEqual(driver.getStyleId(compId));
                    expect(driver.getStyleProperties(compId)).toEqual(this.defaultStyle);
                    done();
                }.bind(this));
            });
        });

        describe('add multi section ', function () {

            beforeEach(function(){
                this.defaultStyleId = 'tpas0';
                this.compId = 'TPASection_iq2eh5lb';
                this.msg = {
                    compId: this.compId,
                    data: {
                        componentType: 'PAGE',
                        page: {
                            pageId: 'book_a_room'
                        }
                    }
                };
                this.defaultStyle = {};
                this.origCompStyle = driver.getStyleProperties(this.msg.compId);
                this.differentCompStyle = driver.getStyleProperties('TPASection_iq2eo3y3');
                this.appDefId = '135aad86-9125-6074-7346-29dc6a3c9bcf';
            });

            it('should add a comp with orig comp style when copyStyle is true ', function (done) {
                this.msg.data.copyStyle = true;

                driver.addComponent(this.appDefId, this.msg, function(compId) {
                    expect(compId).toBeDefined();
                    expect(driver.getStyleId(this.compId)).toEqual(driver.getStyleId(compId));
                    expect(driver.getStyleProperties(compId)).toEqual(this.origCompStyle);
                    done();
                }.bind(this));
            });

            it('should add a comp with specified style when copyStyle is true and styleId is valid', function (done) {
                this.msg.data.copyStyle = true;
                this.msg.data.styleId = 'style-iq2eop1n';

                driver.addComponent(this.appDefId, this.msg, function(compId) {
                    expect(compId).toBeDefined();
                    expect('style-iq2eop1n').toEqual(driver.getStyleId(compId));
                    expect(driver.getStyleProperties(compId)).toEqual(this.differentCompStyle);
                    done();
                }.bind(this));
            });

            it('should add a comp with default style when copyStyle is true and styleId is invalid', function (done) {
                this.msg.data.copyStyle = true;
                this.msg.data.styleId = 'style-1111';

                driver.addComponent(this.appDefId, this.msg, function(compId) {
                    expect(compId).toBeDefined();
                    expect(this.defaultStyleId).toEqual(driver.getStyleId(compId));
                    expect(driver.getStyleProperties(compId)).toEqual(this.defaultStyle);
                    done();
                }.bind(this));
            });

            it('should add a comp with default style when copyStyle is not passed ', function (done) {
                driver.addComponent(this.appDefId, this.msg, function(compId) {
                    expect(compId).toBeDefined();
                    expect(this.defaultStyleId).toEqual(driver.getStyleId(compId));
                    expect(driver.getStyleProperties(compId)).toEqual(this.defaultStyle);
                    done();
                }.bind(this));
            });
        });
    });
});
