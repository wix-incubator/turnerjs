define([
    'platformIntegrationEditor/drivers/editorDriver',
    'platformIntegrationEditor/drivers/platformDriver',
    'jasmine-boot'
],  function (editorDriver, platformDriver) {
    'use strict'

    describe('controllers namespace', function () {
        var appData = platformDriver.platform.getAppDataByAppDefId('dataBinding');
        var token = 'token';

        it('should list controllers in page and in master page', function () {
            var token = 'token'
            var pageControllerId = 'comp-iraaof8y'
            var masterPageControllerId = 'comp-is4nq61y'

            var controllers = platformDriver.controllers.listControllers(token)

            var controllerIds = controllers.map(function(controllerRefObj){ return controllerRefObj.controllerRef.id })
            expect(controllers.length).toBe(2)
            expect(controllerIds).toContain(pageControllerId)
            expect(controllerIds).toContain(masterPageControllerId)
        });

        it('should list controllers in all pages and in master page', function () {
            var token = 'toke'
            var pageControllerId = 'comp-iraaof8y'
            var otherPageControllerId = 'comp-ivtjjtof'
            var masterPageControllerId = 'comp-is4nq61y'

            var controllers = platformDriver.controllers.listAllControllers(token)

            var controllerIds = controllers.map(function(controllerRefObj){ return controllerRefObj.controllerRef.id })
            expect(controllers.length).toBe(3)
            expect(controllerIds).toContain(pageControllerId)
            expect(controllerIds).toContain(otherPageControllerId)
            expect(controllerIds).toContain(masterPageControllerId)
        });

        it('should list connection and connect/disconnect controllers from target components', function () {
            var token = 'token'
            var textBoxId = 'comp-iranzu1l'
            var controllerRef = platformDriver.controllers.listControllers(token)[0].controllerRef
            var targetRef = editorDriver.getCompById(textBoxId)

            // start with 0 connections
            var connections = platformDriver.controllers.listConnections(appData, token, {componentRef: controllerRef})
            expect(connections.length).toBe(0)

            // connect
            platformDriver.controllers.connect(appData,token, {
                connectToRef: targetRef,
                controllerRef: controllerRef,
                role: 'connectionTestRole',
                connectionConfig: 'connectionTestConfig'
            })
            // list 1 connection
            connections = platformDriver.controllers.listConnections(appData, token, {componentRef: targetRef})
            expect(connections.length).toBe(1)
            var connection = connections[0]
            expect(connection.controllerRef).toEqual(controllerRef)
            expect(connection.role).toBe('connectionTestRole')
            expect(connection.config).toBe('connectionTestConfig')

            // diconnect
            platformDriver.controllers.disconnect(appData, token, {
                    connectToRef: targetRef,
                    controllerRef: controllerRef,
                    role: 'connectionTestRole'
            })
            // list 0 controllers
            connections = platformDriver.controllers.listConnections(appData, token, {componentRef: targetRef})
            expect(connections.length).toBe(0)
        });

        it('should query and update controller settings', function (done) {
            var controllerRef = platformDriver.controllers.listControllers(token)[0].controllerRef

            var initialData = platformDriver.controllers.getData(appData, token, {
                controllerRef: controllerRef
            })

            expect(initialData.config).not.toBe({bacon: 'yummy'})
            expect(initialData.name).not.toBe('eggplant')

            // saveConfiguration
            platformDriver.controllers.saveConfiguration(appData, token, {
                controllerRef: controllerRef,
                config: {bacon: 'yummy'}
            }).then(function () {
                // setDisplayName
                return platformDriver.controllers.setDisplayName(appData, token, {
                    controllerRef: controllerRef,
                    name: 'eggplant'
                })
            }).then(function () {
                // getData with correct result
                return platformDriver.controllers.getData(appData, token, {
                    controllerRef: controllerRef
                })
            }).then(function (data) {
                expect(data.config).toEqual({bacon: 'yummy'})
                expect(data.displayName).toEqual('eggplant')
            }).then(done, done.fail);
        });

        describe('--> component being connected is in page', function() {
            it('should list controllers in page and in master page', function() {
                var textBoxId = 'comp-iranzu1l'
                var pageControllerId = 'comp-iraaof8y'
                var masterPageControllerId = 'comp-is4nq61y'
                var textBoxRef = editorDriver.getCompById(textBoxId);

                var connectableControllers = platformDriver.controllers.listConnectableControllers(appData, token, {componentRef: textBoxRef})

                var controllerIds = connectableControllers.map(function(controllerRefObj){ return controllerRefObj.controllerRef.id })
                expect(controllerIds.length).toEqual(2)
                expect(controllerIds).toContain(pageControllerId)
                expect(controllerIds).toContain(masterPageControllerId)
            });
        });

        describe('--> component being connected is in master page', function() {
            it('should list controllers in page and in master page', function() {
                var buttonId = 'comp-is4no2ev'
                var masterPageControllerId = 'comp-is4nq61y'
                var buttonRef = editorDriver.getCompById(buttonId);

                var connectableControllers = platformDriver.controllers.listConnectableControllers(appData, token, {componentRef: buttonRef})

                var controllerIds = connectableControllers.map(function(controllerRefObj){ return controllerRefObj.controllerRef.id })
                expect(controllerIds.length).toEqual(1)
                expect(controllerIds).toContain(masterPageControllerId)
            });
        });

    });
})
