define(['tpaIntegrationEditor/driver/driver', 'lodash', 'jasmine-boot'], function (driver, _) {
    'use strict';

    describe('setWindowPlacement', function(){

        var appDefId = '1311c9da-51ef-f7ae-2576-3704c9c08c51';

        it('should change the app position', function(done){
            var msg = {
                compId: 'ia85wrnq',
                data: {
                    compId: 'ia85wrnq',
                    placement: 'CENTER_LEFT'
                }
            };
            var expectedPlacement = {
                placement: msg.data.placement,
                verticalMargin: 0,
                horizontalMargin: 0
            };
            driver.selectComp(appDefId);

            driver
                .setWindowPlacement(msg)
                .then(function(){
                    return driver.getWindowPlacement(msg);
                })
                .then(function(actualWindowPlacement){
                    expect(actualWindowPlacement).toEqual(expectedPlacement);
                    done();
                })
                .catch(function(message){
                    expect(message).toBeUndefined();
                    done();
                });
        });

        it('should change the app position 2', function(done){
            var msg = {
                compId: 'ia85wrnq',
                data: {
                    compId: 'ia85wrnq',
                    placement: 'BOTTOM_LEFT'
                }
            };
            driver.selectComp(appDefId);
            driver
                .setWindowPlacement(msg)
                .then(function(){
                    return driver.getBoundingRectAndOffsets(msg.compId);
                })
                .then(function(data){
                    var left = _.get(data, 'rect.left');
                    expect(left).toEqual(0);
                    done();
                })
                .catch(function(message){
                    expect(message).toBeUndefined();
                    done();
                });
        });

    });
});
