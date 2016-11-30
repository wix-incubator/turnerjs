define(['lodash'], function (_) {
    'use strict';

    function MockTaskRegistryBuilder() {
        this.registry = {
            primaryTask: null,
            secondaryTasks: []
        };
    }


    MockTaskRegistryBuilder.prototype.setPrimaryTask = function (config) {
        this.registry.primaryTask = getTask(config);
        return this;
    };

    MockTaskRegistryBuilder.prototype.addSecondaryTask = function (config) {
        this.registry.secondaryTasks.push(getTask(config));
        return this;
    };

    MockTaskRegistryBuilder.prototype.build = function(){
        return _.cloneDeep(this.registry);
    };


    function getTask(config) {
        var fakeSave = fakeSaveFunc(config);
        return {
            partialSave: fakeSave,
            fullSave: fakeSave,
            firstSave: fakeSave,
            publish: fakePublishFunc(config),
            getTaskName: function () {
                return config.name || config.fail ? 'failing task' : 'passing task';
            }
        };
    }

    function fakePublishFunc(publishConfigs) {
        var isMultiConfig = _.isArray(publishConfigs),
            i = 0;
        return function (currentSnapshot, resolve, reject) {
            var config = isMultiConfig ? publishConfigs[i] || _.last(publishConfigs) : publishConfigs;
            i++;
            if (config.fail) {
                if (config.error) {
                    reject(config.error);
                } else {
                    reject();
                }
            } else {
                resolve();
            }
        };
    }

    function fakeSaveFunc(saveConfigs) {
        var isMultiConfig = _.isArray(saveConfigs),
            i = 0;
        return function (lastSnapshot, currentSnapshot, resolve, reject) {
            var config = isMultiConfig ? saveConfigs[i] || _.last(saveConfigs) : saveConfigs;
            i++;
            if (config.fail) {
                if (config.error) {
                    reject(config.error);
                } else {
                    reject();
                }
            } else {
                resolve();
            }
        };
    }

    return MockTaskRegistryBuilder;
});
