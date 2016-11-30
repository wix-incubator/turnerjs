define(['zepto', 'lodash', 'tpaIntegration/driver/driver', 'jasmine-boot'], function ($, _, driver) {
    'use strict';

    describe('setHeight', function(){

        describe('setting widget height to be ', function() {
            var compId = 'TPWdgt0-11yp';

            it('higher then original', function (done) {
                driver.appIsAlive(compId, 10000)
                    .then(function(){
                        driver.setHeight(compId, 600);
                    })
                    .then(function () {
                        var $comp = $('#' + compId);
                        expect($comp.height()).toBe(600);
                        done();
                    });
            });

            it('really high', function (done) {
                driver.appIsAlive(compId, 10000)
                    .then(function(){
                        driver.setHeight(compId, 3000);
                    })
                    .then(function (){
                        var $comp = $('#' + compId);
                        expect($comp.height()).toBe(3000);
                        done();
                    });
            });

            it('smaller then 5', function (done) {
                driver.appIsAlive(compId, 10000)
                    .then(function(){
                        driver.setHeight(compId, 1);
                    })
                    .then(function() {
                        var $comp = $('#' + compId);
                        expect($comp.height()).toBe(5);
                        done();
                    });
            });

            it('lower then original height', function (done) {
                driver.appIsAlive(compId, 10000)
                    .then(function(){
                        driver.setHeight(compId, 10);
                    })
                    .then(function() {
                        var $comp = $('#' + compId);
                        expect($comp.height()).toBe(10);
                        done();
                    });
            });

            it('higher then maximum(10000) should still set the height', function(done) {
                driver.appIsAlive(compId, 10000)
                    .then(function(){
                        driver.setHeight(compId, 20001);
                    })
                    .then(function() {
                        var $comp = $('#' + compId);
                        expect($comp.height()).toBe(20001);
                        done();
                    });
            });
        });

        describe('settings widget height without changing anchors', function() {
            var compId = 'TPWdgt0-11yp';
            var compBelow = 'WRchTxth';
            var expectedTopCompBelow = $('#' + compBelow).offset().top;

            it('should not changed the top of the component below', function (done) {
                driver.appIsAlive(compId, 10000)
                    .then(function(){
                        driver.setHeight(compId, 313);
                    }).then(function(){
                        expectedTopCompBelow = $('#' + compBelow).offset().top;
                        driver.setHeight(compId, 600, true);
                    })
                    .then(function () {
                        var $comp = $('#' + compId);
                        expect($comp.height()).toBe(600);
                        expect($('#' + compBelow).offset().top).toBe(expectedTopCompBelow);
                        done();
                    });
            });

            it('should changed the top of the component below', function (done) {
                driver.appIsAlive(compId, 10000)
                    .then(function(){
                        driver.setHeight(compId, 313);
                    }).then(function(){
                        expectedTopCompBelow = $('#' + compBelow).offset().top;
                        driver.setHeight(compId, 600, false);
                    })
                    .then(function () {
                        var $comp = $('#' + compId);
                        expect($comp.height()).toBe(600);
                        expect($('#' + compBelow).offset().top).not.toBe(expectedTopCompBelow);
                        done();
                    });
            });

        });


        describe('setting glued widget height to be ', function() {
            var compId = 'i3q70t1y';

            it('higher then original', function (done) {
                driver.appIsAlive(compId, 10000)
                    .then(function(){
                        driver.setHeight(compId, 600);
                    })
                    .then(function () {
                        var $comp = $('#' + compId);
                        expect($comp.height()).toBe(600);
                        done();
                    });
            });

            it('really high', function (done) {
                driver.appIsAlive(compId, 10000)
                    .then(function(){
                        driver.setHeight(compId, 3000);
                    })
                    .then(function (){
                        var $comp = $('#' + compId);
                        expect($comp.height()).toBe(3000);
                        done();
                    });
            });

            it('smaller then 5', function (done) {
                driver.appIsAlive(compId, 10000)
                    .then(function(){
                        driver.setHeight(compId, 1);
                    })
                    .then(function() {
                        var $comp = $('#' + compId);
                        expect($comp.height()).toBe(5);
                        done();
                    });
            });

            it('lower then original height', function (done) {
                driver.appIsAlive(compId, 10000)
                    .then(function(){
                        driver.setHeight(compId, 10);
                    })
                    .then(function() {
                        var $comp = $('#' + compId);
                        expect($comp.height()).toBe(10);
                        done();
                    });
            });

        });

        describe('setting section widget height to be ', function() {
            var compId = 'i3q6gqqn';

            beforeAll(function(){
                driver.navigateToPage('c4x8');
            });

            it('higher then original', function (done) {
                driver.appIsAlive(compId, 10000)
                    .then(function(){
                        driver.setHeight(compId, 600);
                    })
                    .then(function () {
                        var $comp = $('#' + compId);
                        expect($comp.height()).toBe(600);
                        done();
                    });
            });

            it('smaller then 5', function (done) {
                driver.appIsAlive(compId, 10000)
                    .then(function(){
                        driver.setHeight(compId, 1);
                    })
                    .then(function() {
                        var $comp = $('#' + compId);
                        expect($comp.height()).toBe(5);
                        done();
                    });
            });

            it('lower then original height', function (done) {
                driver.appIsAlive(compId, 10000)
                    .then(function(){
                        driver.setHeight(compId, 10);
                    })
                    .then(function() {
                        var $comp = $('#' + compId);
                        expect($comp.height()).toBe(10);
                        done();
                    });
            });

            it('really high', function (done) {
                driver.appIsAlive(compId, 10000)
                    .then(function(){
                        driver.setHeight(compId, 3000);
                    })
                    .then(function (){
                        var $comp = $('#' + compId);
                        expect($comp.height()).toBe(3000);
                        done();
                    });
            });

        });

        describe('setting multi section height to be ', function() {
            var compId = 'i3q6gr9p';

            beforeAll(function() {
                driver.navigateToPage('c17z1');
            });

            beforeEach(function(done){
                driver.appIsAlive(compId, 10000)
                    .then(function(){
                        done();
                    });
            });

            it('higher then original', function (done) {
                driver.appIsAlive(compId, 10000)
                    .then(function(){
                        driver.setHeight(compId, 600);
                    })
                    .then(function () {
                        var $comp = $('#' + compId);
                        expect($comp.height()).toBe(600);
                        done();
                    });
            });

            it('smaller then 5', function (done) {
                driver.appIsAlive(compId, 10000)
                    .then(function(){
                        driver.setHeight(compId, 1);
                    })
                    .then(function() {
                        var $comp = $('#' + compId);
                        expect($comp.height()).toBe(5);
                        done();
                    });
            });

            it('lower then original height', function (done) {
                driver.appIsAlive(compId, 10000)
                    .then(function(){
                        driver.setHeight(compId, 10);
                    })
                    .then(function() {
                        var $comp = $('#' + compId);
                        expect($comp.height()).toBe(10);
                        done();
                    });
            });

            it('really high', function (done) {
                driver.appIsAlive(compId, 10000)
                    .then(function(){
                        driver.setHeight(compId, 3000);
                    })
                    .then(function (){
                        var $comp = $('#' + compId);
                        expect($comp.height()).toBe(3000);
                        done();
                    });
            });

        });
    });
});
