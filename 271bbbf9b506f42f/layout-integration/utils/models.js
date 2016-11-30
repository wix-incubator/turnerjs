/*eslint strict:["error", "global"]*/
'use strict';

var _ = require('lodash');

function generateId() {
    return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
}

function TestModel(prefix, name, existingId){
    this.id = existingId || prefix + '_' + generateId();
    this.name = name || '';
    this.asJSON = () => JSON.parse(JSON.stringify(this));
}

function It(name, testData, existingId, runInBuild){
    TestModel.call(this, 'it', name, existingId);
    this.runInBuild = runInBuild || typeof runInBuild === 'undefined';
    this.testData = testData || {};
    this.cloneData = test => this.setData(test.testData);
    this.setData = (data) => {
        this.testData = Object.assign({}, data);
        return this;
    };
}

It.fromJSON = (data) => new It(data.name, data.testData, data.id, data.runInBuild);

const asTestsMap = (testsData) => {
    return testsData.reduce((testsMap, test) => {
        var testAsIt = test instanceof It ? test : It.fromJSON(test);
        testsMap[testAsIt.id] = testAsIt;
        return testsMap;
    }, {});
};

function Describe(name, experimentConfig, tests, existingId){
    TestModel.call(this, 'desc', name, existingId);
    this.tests = {};
    this.experiments = experimentConfig || {};
    this.withTests = function() {
        Object.assign(this.tests, asTestsMap(_.toArray(arguments)));
        return this;
    };
    this.withExperiments = function(newConfig){
        this.experiments = newConfig;
    };
    this.get = id => this.tests[id];
    if (tests) {
        this.withTests.apply(this, tests);
    }
}

Describe.fromJSON = (data) => new Describe(data.name, data.experiments, _.toArray(data.tests), data.id);

module.exports = {
    Describe: Describe,
    It: It
};
