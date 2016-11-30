define([
    'utils',
    'lodash',
    'documentServices/wixCode/utils/utils',
    'bluebird',
    'documentServices/wixCode/utils/errors',
    'definition!documentServices/wixCode/services/fileSystemService'
], function (utils, _, wixCodeUtils, Promise, errors, fileSystemServiceDef) {
    'use strict';

    var APP_ID = '2bc4f47c-9198-4ea6-b3ef-1b956e1c0ddf';
    var BASE_PATH = '/file/' + APP_ID + '/';
    var PUBLIC_FOLDER_NAME = 'public';
    var BASE_SERVICE_URL = 'http://editor.wix.com/wix-code-ide-server';
    var BASE_URL = BASE_SERVICE_URL + BASE_PATH;
    var SI = 'FAKE-SI';
    var SCARI = 'FAKE-SCARI';
    var META_QUERY_PARAM = 'parts=meta';
    var DEFAULT_HEADERS = {
        'X-Wix-Si': SI,
        'X-Wix-Scari': SCARI
    };

    var fileSystemService, publicFolder;

    function createMockFileSystemItem(name, parentPath, isFolder, virtual) {
        return {
            virtual: virtual,
            localTimeStamp: 0,
            eTag: '"virtual"',
            name: name,
            length: 0,
            directory: isFolder,
            location: parentPath + '/' + name,
            attributes: {
                readOnly: false
            }
        };
    }

    describe('fileSystemService', function () {
        var codeAppInfo = wixCodeUtils.createCodeAppInfo(BASE_SERVICE_URL, APP_ID, SI, SCARI);

        beforeEach(function() {
            fileSystemService = fileSystemServiceDef(_, utils, wixCodeUtils, Promise, errors);
            publicFolder = fileSystemService.getRoots(codeAppInfo).public;
        });

        function testCreateFileOrFolder(methodUnderTest, itemName, isDirectory) {
            var expectedItem = createMockFileSystemItem(itemName, PUBLIC_FOLDER_NAME, isDirectory);
            spyOn(wixCodeUtils, 'sendRequestObj').and.returnValue(Promise.resolve(expectedItem));

            return methodUnderTest(codeAppInfo, itemName, publicFolder).then(function (newItem) {
                expect(wixCodeUtils.sendRequestObj).toHaveBeenCalledWith(jasmine.objectContaining({
                    type: 'POST',
                    contentType: 'application/json;charset=UTF-8',
                    headers: _.assign({
                        'X-Create-Options': 'no-overwrite'
                    }, DEFAULT_HEADERS),
                    timeout: 15000,
                    data: JSON.stringify({
                        name: itemName,
                        localTimeStamp: 0,
                        directory: isDirectory
                    }),
                    url: BASE_URL + publicFolder.location
                }));
                expect(newItem).toEqual(expectedItem);
            });
        }

        function testCopyOfMoveFileSystemItem(copy, fileName, targetFolderName, newFileName) {
            var parentPath = PUBLIC_FOLDER_NAME + '/' + targetFolderName;
            var sourceFile = createMockFileSystemItem(fileName, PUBLIC_FOLDER_NAME, false);
            var targetFolder = createMockFileSystemItem(targetFolderName, parentPath, true);

            var resultFileName = newFileName ? newFileName : fileName;
            var expectedFile = createMockFileSystemItem(resultFileName, parentPath, false);

            spyOn(wixCodeUtils, 'sendRequestObj').and.returnValue(Promise.resolve(expectedFile));

            var headerCreateOption;
            var methodUnderTest;
            if (copy) {
                headerCreateOption = 'copy';
                methodUnderTest = fileSystemService.copy;
            } else {
                headerCreateOption = 'move';
                methodUnderTest = fileSystemService.move;
            }

            return methodUnderTest(codeAppInfo, sourceFile, targetFolder, newFileName).then(function (newFile) {
                expect(wixCodeUtils.sendRequestObj).toHaveBeenCalledWith(jasmine.objectContaining({
                    type: 'POST',
                    contentType: 'application/json;charset=UTF-8',
                    headers: _.assign({
                        'X-Create-Options': 'no-overwrite,' + headerCreateOption
                    }, DEFAULT_HEADERS),
                    timeout: 15000,
                    data: JSON.stringify({
                        name: resultFileName,
                        location: BASE_PATH + sourceFile.location // TBD: change to short format after server changes its expectation
                    }),
                    url: BASE_URL + targetFolder.location
                }));
                expect(newFile).toEqual(expectedFile);
            });
        }

        describe('createFolder', function () {
            it('should create a folder under the given parent folder', function (done) {
                testCreateFileOrFolder(fileSystemService.createFolder, 'FOLDER', true).then(done);
            });

            it('should reject when parent folder is illegal', function (done) {
                fileSystemService.createFolder(codeAppInfo, 'newFolder', undefined).catch(done);
            });

            it('should reject  when folder name is illegal', function (done) {
                fileSystemService.createFolder(codeAppInfo, undefined, publicFolder).catch(done);
            });
        });

        describe('createFile', function () {
            it('should create a file under the given parent folder', function (done) {
                testCreateFileOrFolder(fileSystemService.createFile, 'file.js', false).then(done);
            });

            it('should reject when  parent folder is illegal', function (done) {
                fileSystemService.createFile(codeAppInfo, 'newFile.js', undefined).catch(done);
            });

            it('should reject when file name is illegal', function (done) {
                fileSystemService.createFile(codeAppInfo, undefined, publicFolder).catch(done);
            });
        });

        describe('create', function () {
            function testCreateFileSystemItem(itemName, isDirectory) {
                var requestedItem = createMockFileSystemItem(itemName, PUBLIC_FOLDER_NAME, isDirectory, true);
                var expectedItem = createMockFileSystemItem(itemName, PUBLIC_FOLDER_NAME, isDirectory, false);
                spyOn(wixCodeUtils, 'sendRequestObj').and.returnValue(Promise.resolve(expectedItem));

                return fileSystemService.create(codeAppInfo, requestedItem).then(function (newItem) {
                    expect(wixCodeUtils.sendRequestObj).toHaveBeenCalledWith(jasmine.objectContaining({
                        type: 'POST',
                        contentType: 'application/json;charset=UTF-8',
                        headers: _.assign({
                            'X-Create-Options': 'no-overwrite'
                        }, DEFAULT_HEADERS),
                        timeout: 15000,
                        data: JSON.stringify({
                            name: itemName,
                            localTimeStamp: 0,
                            directory: isDirectory
                        }),
                        url: BASE_URL + publicFolder.location
                    }));
                    expect(newItem).toEqual(expectedItem);
                });
            }

            it('should return the given item if not virtual', function (done) {
                var fileName = 'aFile.js';
                var expectedFile = createMockFileSystemItem(fileName, PUBLIC_FOLDER_NAME, false, false);
                fileSystemService.create(codeAppInfo, expectedFile).then(function (file) {
                    expect(file).toEqual(expectedFile);
                    done();
                });
            });

            it('should create a file', function (done) {
                testCreateFileSystemItem('file.js', false).then(done);
            });

            it('should create a folder', function (done) {
                testCreateFileSystemItem('folder', true).then(done);
            });

            it('should reject when given item is illegal', function (done) {
                fileSystemService.create(codeAppInfo, 'newFile.js').catch(done);
            });
        });

        describe('deleteItem', function () {
            it('should delete the given file', function (done) {
                var fileName = 'aFile.js';
                var fileToDelete = createMockFileSystemItem(fileName, PUBLIC_FOLDER_NAME, false);

                spyOn(wixCodeUtils, 'sendRequestObj').and.returnValue(Promise.resolve({}));

                fileSystemService.deleteItem(codeAppInfo, fileToDelete).then(function ( /*result*/) {
                    expect(wixCodeUtils.sendRequestObj).toHaveBeenCalledWith(jasmine.objectContaining({
                        type: 'DELETE',
                        timeout: 15000,
                        url: BASE_URL + fileToDelete.location
                    }));
                    done();
                });
            });

            it('should reject when file path is illegal', function (done) {
                fileSystemService.deleteItem(codeAppInfo, undefined).catch(done);
            });
        });

        describe('copy', function () {
            it('should copy the given file in the given location', function (done) {
                testCopyOfMoveFileSystemItem(true, 'aFile.js', 'targetFolder').then(done);
            });

            it('should copy the given file in the given location and rename it', function (done) {
                testCopyOfMoveFileSystemItem(true, 'aFile.js', 'targetFolder', 'newFileName.js').then(done);
            });

            it('should reject when source file path is illegal', function (done) {
                fileSystemService.copy(codeAppInfo, undefined, 'targetPath').catch(done);
            });

            it('should reject when target folder path is illegal', function (done) {
                fileSystemService.copy(codeAppInfo, 'sourcePath', undefined).catch(done);
            });
        });

        describe('move', function () {
            it('should move the given file to the given location', function (done) {
                testCopyOfMoveFileSystemItem(false, 'aFile.js', 'targetFolder').then(done);
            });

            it('should move the given file to the given location and rename it', function (done) {
                testCopyOfMoveFileSystemItem(false, 'aFile.js', 'targetFolder', 'newFileName.js').then(done);
            });

            it('should reject when source file path is illegal', function (done) {
                fileSystemService.move(codeAppInfo, undefined, 'targetPath').catch(done);
            });

            it('should reject when target folder path is illegal', function (done) {
                fileSystemService.move(codeAppInfo, 'sourcePath', undefined).catch(done);
            });
        });

        describe('getChildren', function () {
            function getChildrenAjaxResponse(children) {
                return Promise.resolve({
                    children: children
                });
            }

            it('should return a list of all direct children (folders and files) of the given folder', function (done) {
                var folderName = 'aFolder';
                var folder = createMockFileSystemItem(folderName, PUBLIC_FOLDER_NAME, true);

                var child1 = createMockFileSystemItem('child1', PUBLIC_FOLDER_NAME, true);
                var child2 = createMockFileSystemItem('child2.js', PUBLIC_FOLDER_NAME, false);

                spyOn(wixCodeUtils, 'sendRequestObj').and.returnValue(getChildrenAjaxResponse([child1, child2]));

                fileSystemService.getChildren(codeAppInfo, folder).then(function (children) {
                    expect(wixCodeUtils.sendRequestObj).toHaveBeenCalledWith(jasmine.objectContaining({
                        type: 'GET',
                        url: BASE_URL + folder.location + '?depth=1'
                    }));
                    expect(Array.isArray(children)).toBeTruthy();
                    expect(children.length).toEqual(2);
                    expect(children[0]).toEqual(child1);
                    expect(children[1]).toEqual(child2);
                    done();
                });
            });

            it('should reject when the given folder path is illegal', function (done) {
                fileSystemService.getChildren(codeAppInfo, undefined).catch(done);
            });
        });

        describe('getMetadata', function () {
            it('should return the metadata of the given file system item', function (done) {
                var fileName = 'aFile.js';
                var file = createMockFileSystemItem(fileName, PUBLIC_FOLDER_NAME, false);

                spyOn(wixCodeUtils, 'sendRequestObj').and.returnValue(Promise.resolve(file));

                fileSystemService.getMetadata(codeAppInfo, file).then(function (metadata) {
                    expect(wixCodeUtils.sendRequestObj).toHaveBeenCalledWith(jasmine.objectContaining({
                        type: 'GET',
                        url: BASE_URL + file.location + '?' + META_QUERY_PARAM
                    }));
                    expect(metadata).toEqual(file);
                    done();
                });
            });

            it('should reject when file path is illegal', function (done) {
                fileSystemService.getMetadata(codeAppInfo, undefined).catch(done);
            });
        });

        describe('readFile', function () {
            function readFileAjaxResponse(content) {
                return Promise.resolve(content);
            }

            it('should read the content of the given file', function (done) {
                var fileName = 'aFile.js';
                var file = createMockFileSystemItem(fileName, [PUBLIC_FOLDER_NAME], false);
                var expectedContent = 'this is the content of the file;';

                spyOn(wixCodeUtils, 'sendRequestObj').and.returnValue(readFileAjaxResponse(expectedContent));

                fileSystemService.readFile(codeAppInfo, file).then(function (content) {
                    expect(wixCodeUtils.sendRequestObj).toHaveBeenCalledWith(jasmine.objectContaining({
                        type: 'GET',
                        url: BASE_URL + file.location
                    }));
                    expect(content).toEqual(expectedContent);
                    done();
                });
            });

            it('should reject when file path is illegal', function (done) {
                fileSystemService.readFile(codeAppInfo, undefined).catch(done);
            });
        });

        describe('writeFile', function () {
            it('should write/override the given content to the given file', function (done) {
                var fileName = 'aFile.js';
                var targetFile = createMockFileSystemItem(fileName, PUBLIC_FOLDER_NAME, false);

                spyOn(wixCodeUtils, 'sendRequestObj').and.returnValue(Promise.resolve(targetFile));

                var content = 'this is the content of the file;';
                fileSystemService.writeFile(codeAppInfo, targetFile, content).then(function (file) {
                    expect(wixCodeUtils.sendRequestObj).toHaveBeenCalledWith(jasmine.objectContaining({
                        type: 'PUT',
                        headers: _.assign({
                            'If-Match': targetFile.eTag
                        }, DEFAULT_HEADERS),
                        contentType: 'text/plain;charset=UTF-8',
                        log: false,
                        data: content,
                        url: BASE_URL + targetFile.location
                    }));
                    expect(file).toEqual(targetFile);
                    done();
                });
            });

            it('should write/override the given empty content to the given file', function (done) {
                var fileName = 'aFile.js';
                var targetFile = createMockFileSystemItem(fileName, PUBLIC_FOLDER_NAME, false);

                spyOn(wixCodeUtils, 'sendRequestObj').and.returnValue(Promise.resolve(targetFile));

                var content = '';
                fileSystemService.writeFile(codeAppInfo, targetFile, content).then(function (file) {
                    expect(wixCodeUtils.sendRequestObj).toHaveBeenCalledWith(jasmine.objectContaining({
                        type: 'PUT',
                        headers: _.assign({
                            'If-Match': targetFile.eTag
                        }, DEFAULT_HEADERS),
                        contentType: 'text/plain;charset=UTF-8',
                        log: false,
                        data: content,
                        url: BASE_URL + targetFile.location
                    }));
                    expect(file).toEqual(targetFile);
                    done();
                });
            });

            it('should write/patch the given partial change content to the given file', function (done) {
                var fileName = 'aFile.js';
                var targetFile = createMockFileSystemItem(fileName, PUBLIC_FOLDER_NAME, false);
                var partialChange = {
                    diff: [{
                        start: 583,
                        end: 583,
                        text: 'bla bla'
                    }, {
                            start: 773,
                            end: 773,
                            text: '   '
                        }]
                };
                spyOn(wixCodeUtils, 'sendRequestObj').and.returnValue(Promise.resolve(targetFile));

                fileSystemService.writeFile(codeAppInfo, targetFile, partialChange).then(function (file) {
                    expect(wixCodeUtils.sendRequestObj).toHaveBeenCalledWith(jasmine.objectContaining({
                        type: 'POST',
                        headers: _.assign({
                            'X-HTTP-Method-Override': 'PATCH',
                            'If-Match': targetFile.eTag
                        }, DEFAULT_HEADERS),
                        contentType: 'text/plain;charset=UTF-8',
                        log: false,
                        data: JSON.stringify(partialChange),
                        url: BASE_URL + targetFile.location
                    }));
                    expect(file).toEqual(targetFile);
                    done();
                });
            });

            it('should reject when file path is illegal', function (done) {
                fileSystemService.writeFile(codeAppInfo, undefined).catch(done);
            });
        });

        describe('read', function () {
            it('should read the content of an existing file', function (done) {
                var fileName = 'mytestfile.js';
                var content = 'this is the content';
                var descriptor = createMockFileSystemItem(fileName, PUBLIC_FOLDER_NAME, false, false);

                spyOn(wixCodeUtils, 'sendRequestObj').and.callFake(function(request) {
                    if (request.url.indexOf(META_QUERY_PARAM) > 0) {
                        return Promise.resolve(descriptor);
                    }

                    return Promise.resolve(content);
                });

                fileSystemService.read(codeAppInfo, PUBLIC_FOLDER_NAME + '/' + fileName).then(function (result) {
                    expect(result.file).toEqual(descriptor);
                    expect(result.content).toEqual(content);
                    done();
                });
            });

            it('should try reading the content of a non-existing file without default content', function (done) {
                var fileName = 'mytestfile.js';
                var content = '';
                var descriptor = createMockFileSystemItem(fileName, PUBLIC_FOLDER_NAME, false, true);

                spyOn(wixCodeUtils, 'sendRequestObj').and.callFake(function(request) {
                    if (request.url.indexOf(META_QUERY_PARAM) > 0) {
                        return Promise.reject({status: 404});
                    }

                    return Promise.reject(new Error('should not send other requests'));
                });

                fileSystemService.read(codeAppInfo, PUBLIC_FOLDER_NAME + '/' + fileName).then(function (result) {
                    expect(result.file).toEqual(descriptor);
                    expect(result.content).toEqual(content);
                    done();
                });
            });

            it('should try reading the content of a non-existing file with a given default content', function (done) {
                var fileName = 'mytestfile.js';
                var content = 'my default content';
                var descriptor = createMockFileSystemItem(fileName, PUBLIC_FOLDER_NAME, false, true);

                spyOn(wixCodeUtils, 'sendRequestObj').and.callFake(function(request) {
                    if (request.url.indexOf(META_QUERY_PARAM) > 0) {
                        return Promise.reject({status: 404});
                    }

                    return Promise.reject(new Error('should not send other requests'));
                });

                fileSystemService.read(codeAppInfo, PUBLIC_FOLDER_NAME + '/' + fileName, content).then(function (result) {
                    expect(result.file).toEqual(descriptor);
                    expect(result.content).toEqual(content);
                    done();
                });
            });

            it('should try reading the content of a file, but the server fails (some error != 404)', function (done) {
                var fileName = 'mytestfile.js';

                spyOn(wixCodeUtils, 'sendRequestObj').and.callFake(function(request) {
                    if (request.url.indexOf(META_QUERY_PARAM) > 0) {
                        return Promise.reject({status: 666});
                    }

                    return Promise.reject(new Error('should not send other requests'));
                });

                fileSystemService.read(codeAppInfo, PUBLIC_FOLDER_NAME + '/' + fileName).then(_.noop, function (result) {
                    expect(result instanceof errors.FileSystemError).toEqual(true);
                    done();
                });
            });
        });
    });
});
