/*eslint strict:["error", "global"]*/
'use strict';

const glob = require('glob'),
    fs = require('fs'),
    path = require('path'),
    _ = require('lodash'),
    models = require('./models');

const Describe = models.Describe;
const It = models.It;

const createTestsAPI = (absolutePathToFolerForAPI) => {
    const TESTS_FOLDER = absolutePathToFolerForAPI || path.join(__dirname, '../testsData');

    function testFile(describeId){
        return path.join(TESTS_FOLDER, describeId + '.json');
    }

    function readJSON(filePath){
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }

    function writeJSON(filePath, jsonData){
        fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 4));
    }

    const removeTest = (describeId, testId) => {
        var testFilePath = testFile(describeId);
        if (fs.existsSync(testFilePath)){
            var describe = readJSON(testFilePath);
            if (_.size(describe.tests) === 1 && _.has(describe.tests, testId)) {
                fs.unlinkSync(testFilePath);
            } else {
                delete describe.tests[testId];
                writeJSON(testFilePath, describe);
            }
        }
    };

    const createTestInExistingDescribe = (describeId, testName) => {
        var testFilePath = testFile(describeId);
        var describeData = readJSON(testFilePath);
        var newTest = new It(testName);

        var newDescribe = Describe
            .fromJSON(describeData)
            .withTests(newTest)
            .asJSON();

        writeJSON(testFilePath, newDescribe);
        return {describeId: describeId, testId: newTest.id};
    };

    const createTestWithNewDescribe = (describeName, testName) => {
        var newTest = new It(testName);
        var describe = new Describe(describeName)
            .withTests(newTest)
            .asJSON();

        var testFilePath = testFile(describe.id);

        writeJSON(testFilePath, describe);
        return {describeId: describe.id, testId: newTest.id};
    };

    const forkTestInExistingDescribe = (describeId, currTestId, testName) => {
        var testFilePath = testFile(describeId);
        var describe = Describe.fromJSON(readJSON(testFilePath));

        var newTest = new It(testName)
            .cloneData(describe.get(currTestId));
        var newDescribe = describe.withTests(newTest).asJSON();

        writeJSON(testFilePath, newDescribe);
        return {describeId: describeId, testId: newTest.id};
    };

    const forkTestWithNewDescribe = (describeId, currTestId, describeName, testName) => {
        var testFilePath = testFile(describeId);
        var describe = Describe.fromJSON(readJSON(testFilePath));

        var newTest = new It(testName)
            .cloneData(describe.get(currTestId));

        var newDescribeData = new Describe(describeName)
            .withTests(newTest)
            .asJSON();

        writeJSON(testFilePath(newDescribeData.id), newDescribeData);

        return {describeId: newDescribeData.id, testId: newTest.id};
    };

    const saveTestData = (describeId, testId, data) => {
        var testFilePath = testFile(describeId);
        var describe = Describe.fromJSON(readJSON(testFilePath));

        describe.get(testId)
            .setData(data);

        writeJSON(testFilePath, describe.asJSON());
    };


    const getAllTestsSync = () => {
        return glob.sync(TESTS_FOLDER + '/*.json')
            .reduce(function(testsData, file){
                var describeId = file.split('/').pop().replace('.json', '');
                testsData[describeId] = readJSON(file);
                return testsData;
            }, {});
    };

    const getAllTests = (requestedDescribeId, callback) => {

        var describeFileName = (requestedDescribeId ? requestedDescribeId : '*' ) + '.json';

        return glob(TESTS_FOLDER + '/' + describeFileName, function(err, files) {
            if (err){
                callback(err);
            } else {
                var data = files.reduce(function (testsData, file) {
                    var describeId = file.split('/').pop().replace('.json', '');
                    testsData[describeId] = readJSON(file);
                    return testsData;
                }, {});
                callback(null, data);
            }
        });
    };

    const getDescribe = (id) => {
        return readJSON(testFile(id));
    };

    const saveDescribe = (id, data) => {
        writeJSON(testFile(id), data);
    };

    return {
        getDescribe,
        saveDescribe,
        removeTest,
        createTestInExistingDescribe,
        createTestWithNewDescribe,
        forkTestInExistingDescribe,
        forkTestWithNewDescribe,
        saveTestData,
        getAllTests,
        getAllTestsSync
    };
};

module.exports = createTestsAPI;
