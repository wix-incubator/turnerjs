/*eslint strict:["error", "global"]*/
'use strict';

const path = require('path');
const tempFolder = './temp';
const TESTS_ROOT_FOLDER = path.resolve(__dirname, tempFolder);
const layoutTestsAPI = require('../utils/createLayoutTestsDataAPI')(TESTS_ROOT_FOLDER);
const fs = require('fs');
const rimraf = require('rimraf');
const _ = require('lodash');

const mockEmptyDescribe = {
    id: 'mockDescribe',
    tests: {
        firstTest: {
            id: 'firstTest',
            name: 'first test name',
            testData: {}
        },
        secondTest: {
            id: 'secondTest',
            name: 'second test name',
            testData: {}
        }
    }
};

const createMockDescribe = (data, cb) => fs.writeFile(TESTS_ROOT_FOLDER + '/' + data.id + '.json', JSON.stringify(data), 'utf8', cb);
const testPath = id => path.join(TESTS_ROOT_FOLDER, id + '.json');

describe('createLayoutTestsDataAPI', function () {

    beforeAll(done => fs.mkdir(TESTS_ROOT_FOLDER, done));
    afterAll(done => rimraf(TESTS_ROOT_FOLDER, done));

    beforeEach(done => createMockDescribe(mockEmptyDescribe, done));
    afterEach(done => fs.unlink(testPath(mockEmptyDescribe.id), done));

    it('setup - should work with a temp folder', done => {
        fs.stat(TESTS_ROOT_FOLDER, function (err, stats) {
            expect(err).toBe(null);
            expect(stats.isDirectory()).toBe(true);
            done();
        });
    });

    describe('createTestWithNewDescribe', () => {
        it('should create a new describe JSON with a test and save it in the folder', done => {
            let describeName = 'mockDescribe';
            let itName = 'mockIt';
            let result = layoutTestsAPI.createTestWithNewDescribe(describeName, itName);
            expect(result.describeId).toBeDefined();
            expect(result.testId).toBeDefined();
            fs.readFile(testPath(result.describeId), 'utf8', (err, jsonFromFile) => {
                let data = JSON.parse(jsonFromFile);
                expect(data.id).toEqual(result.describeId);
                expect(data.tests[result.testId]).toBeDefined();
                done();
            });
        });
    });
    describe('saveDescribe', () => {
        it('should save the describe JSON to the folder', done => {
            let mockDescribe = _.clone(mockEmptyDescribe);
            mockDescribe.tests.newTest = {id: 'newTest', name: 'new test name'};
            layoutTestsAPI.saveDescribe(mockEmptyDescribe.id, mockDescribe);
            fs.readFile(testPath(mockDescribe.id), 'utf8', (err, result) => {
                var data = JSON.parse(result);
                expect(data.tests.newTest).toEqual({id: 'newTest', name: 'new test name'});
                done();
            });
        });
    });

    describe('getDescribe', () => {
        it('should return the JSON for the given describe', done => {
            let mockDescribeData = {id: 'mock-describe-id', tests: {}, name: 'some desc name'};
            createMockDescribe(mockDescribeData, ()=> {
                let actual = layoutTestsAPI.getDescribe('mock-describe-id');
                expect(actual).toEqual(mockDescribeData);
                done();
            });
        });
    });

    describe('removeTest', () => {
        xit('should remove the test from the given describe', done => {
            //TODO: see why there is leakage from the saveDescribe test
            layoutTestsAPI.removeTest('mockDescribe', 'firstTest');
            fs.readFile(testPath('mockDescribe'), 'utf8', (err, jsonFromFile) => {
                let data = JSON.parse(jsonFromFile);
                expect(data).toEqual({
                    id: 'mockDescribe',
                    tests: {
                        secondTest: {
                            id: 'secondTest',
                            name: 'second test name',
                            testData: {}
                        }
                    }
                });
                done();
            });
        });
    });

    describe('createTestInExistingDescribe', () => {

    });

    describe('forkTestInExistingDescribe', () => {

    });

    describe('forkTestWithNewDescribe', () => {

    });

    describe('saveTestData', () => {
        it('should update the it and save it to filesystem', done => {
            layoutTestsAPI.saveTestData('mockDescribe', 'firstTest', {
                someData: {}
            });
            fs.readFile(testPath('mockDescribe'), 'utf8', (err, jsonFromFile) => {
                let data = JSON.parse(jsonFromFile);
                expect(data.tests.firstTest.testData).toEqual({
                    someData: {}
                });
                done();
            });
        });
    });

    describe('getAllTests', () => {
        it('should return all the tess in the folder', () => {

        });
    });

    describe('getAllTestsSync', () => {

    });


});
