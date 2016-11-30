define(['lodash', 'utils', 'documentServices/wixCode/utils/utils', 'bluebird', 'documentServices/wixCode/utils/errors'], function (_, utils, wixCodeUtils, Promise, errors) {

    'use strict';

    var CONTENT_TYPE_JSON = 'application/json;charset=UTF-8';
    var CONTENT_TYPE_PLAIN_TEXT = 'text/plain;charset=UTF-8';

    var PUBLIC_FOLDER_NAME = 'public';
    var BACKEND_FOLDER_NAME = 'backend';
    var SCHEMAS_FOLDER_NAME = '.schemas';
    var PATH_SEPARATOR = '/';

    var LONG_LOCATION_FORMAT_REGEX = /^\/file\/[^\/]+\/(.+)$/;

    function ensureLongLocationFormat(location, codeAppInfo) {
        var result = location.match(LONG_LOCATION_FORMAT_REGEX);
        return result ? location : ('/file/' + codeAppInfo.appId + '/' + location);
    }

    function ensureShortLocationFormat(location) {
        var result = location.match(LONG_LOCATION_FORMAT_REGEX);
        return result ? result[1] : location;
    }

    function ensureDescriptorWithShortLocationFormat(descriptor) {
        return _.assign({}, descriptor, {location: ensureShortLocationFormat(descriptor.location)});
    }

    function isFileSystemItem(fileSystemItem) {
        return _.isObject(fileSystemItem) && fileSystemItem.name && fileSystemItem.location;
    }

    function isFolder(fileSystemItem) {
        return isFileSystemItem(fileSystemItem) && fileSystemItem.directory;
    }

    function isFile(fileSystemItem) {
        return isFileSystemItem(fileSystemItem) && !fileSystemItem.directory;
    }

    function isValidName(str) {
        return _.isString(str) && str.length > 0;
    }

    function isValidContent(content) {
        return _.isString(content);
    }

    function isValidPartialChange(partialChange) {
        return _.isObject(partialChange) && partialChange.diff && _.isArray(partialChange.diff);
    }

    function getUrl(codeAppInfo, location, urlParams) {
        var paramStr = urlParams ? ('?' + utils.urlUtils.toQueryString(urlParams)) : '';

        return codeAppInfo.baseUrl + ensureLongLocationFormat(location, codeAppInfo) + paramStr;
    }

    function stripLastPathSeperatorIfExists(relativeLocation) {
        if (relativeLocation.lastIndexOf(PATH_SEPARATOR) === relativeLocation.length - 1) {
            return relativeLocation.substring(0, relativeLocation.length - 1);
        }
        return relativeLocation;
    }

    function sendRequest(request, codeAppInfo, location, additionalParams) {
        request.headers = _.assign({
            'X-Wix-Si': codeAppInfo.signedInstance,
            'X-Wix-Scari': codeAppInfo.scari
        }, request.headers);
        request.url = getUrl(codeAppInfo, location, additionalParams);
        return wixCodeUtils.sendRequestObj(request);
    }

    function doCreateFileOrFolder(codeAppInfo, itemName, parentFolder, isDirectory) {
        if (!isFolder(parentFolder)) {
            return Promise.reject(new errors.ArgumentError('parentFolder', 'fileSystemService.doCreateFileOrFolder', parentFolder, 'folder object'));
        }

        if (!isValidName(itemName)) {
            return Promise.reject(new errors.ArgumentError('itemName', 'fileSystemService.doCreateFileOrFolder', itemName));
        }

        var headers = {
            'X-Create-Options': 'no-overwrite'
        };
        var payload = {
            name: itemName,
            localTimeStamp: 0,
            directory: isDirectory
        };
        var request = {
            type: wixCodeUtils.requestTypes.POST,
            contentType: CONTENT_TYPE_JSON,
            headers: headers,
            timeout: 15000,
            data: JSON.stringify(payload)
        };

        return sendRequest(request, codeAppInfo, parentFolder.location).then(ensureDescriptorWithShortLocationFormat);
    }

    function doCopyOrMove(codeAppInfo, operation, fileSystemItem, targetFolder, newName) {
        if (!isFileSystemItem(fileSystemItem)) {
            return Promise.reject(new errors.ArgumentError('fileSystemItem', 'fileSystemService.doCopyOrMove', fileSystemItem));
        }

        if (!isFolder(targetFolder)) {
            return Promise.reject(new errors.ArgumentError('targetFolder', 'fileSystemService.doCopyOrMove', targetFolder, 'folder object'));
        }

        if (!newName) {
            var parts = fileSystemItem.location.split(PATH_SEPARATOR);
            //if we rename a folder - last "cell" in the parts array will be empty so we pop twice...
            newName = parts.pop() || parts.pop();
        }

        var headers = {
            'X-Create-Options': 'no-overwrite,' + operation
        };

        var payload = {
            name: newName,
            location: ensureLongLocationFormat(fileSystemItem.location, codeAppInfo) // TBD: change to short format after server changes its expectation
        };

        var request = {
            type: wixCodeUtils.requestTypes.POST,
            contentType: CONTENT_TYPE_JSON,
            headers: headers,
            timeout: 15000,
            data: JSON.stringify(payload)
        };

        return sendRequest(request, codeAppInfo, targetFolder.location).then(ensureDescriptorWithShortLocationFormat);
    }

    function createFolder(codeAppInfo, folderName, parentFolder) {
        return doCreateFileOrFolder(codeAppInfo, folderName, parentFolder, true);
    }

    function createFile(codeAppInfo, fileName, parentFolder) {
        return doCreateFileOrFolder(codeAppInfo, fileName, parentFolder, false);
    }

    /**
     * Creates a file system item if the given fileSystemItem is virtual.
     * If the given fileSystemItem is a folder, a new folder will be created.
     * If the given fileSystemItem is a file, a new file will be created.
     * If the given fileSystemItem is NOT virtual, the given descriptor will be returned.
     * @param  {any} fileSystemItem - should be virtual
     */
    function create(codeAppInfo, fileSystemItem) {
        if (!isFileSystemItem(fileSystemItem)) {
            return Promise.reject(new errors.ArgumentError('parentFolder', 'fileSystemService.create', fileSystemItem, 'fileSystemItem object'));
        }
        if (!fileSystemItem.virtual) {
            return Promise.resolve(fileSystemItem);
        }

        var location = stripLastPathSeperatorIfExists(fileSystemItem.location);

        var parentPath = location.split(PATH_SEPARATOR).slice(0, -1).join(PATH_SEPARATOR);
        var parent = getVirtualDescriptor(codeAppInfo, parentPath, true);

        return doCreateFileOrFolder(codeAppInfo, fileSystemItem.name, parent, fileSystemItem.directory);
    }

    function deleteItem(codeAppInfo, itemToDelete) {
        if (!isFileSystemItem(itemToDelete)) {
            return Promise.reject(new errors.ArgumentError('location', 'fileSystemService.deleteItem', itemToDelete));
        }

        var request = {
            type: wixCodeUtils.requestTypes.DELETE,
            timeout: 15000
        };
        return sendRequest(request, codeAppInfo, itemToDelete.location);
    }

    function copy(codeAppInfo, itemToCopy, targetFolder, newName) {
        return doCopyOrMove(codeAppInfo, 'copy', itemToCopy, targetFolder, newName);
    }

    function move(codeAppInfo, itemToMove, targetFolder, newName) {
        return doCopyOrMove(codeAppInfo, 'move', itemToMove, targetFolder, newName);
    }

    function getChildren(codeAppInfo, parentFolder) {

        function extractChildren(response) {
            return _.map(response.children || [], ensureDescriptorWithShortLocationFormat);
        }

        if (!isFolder(parentFolder)) {
            return Promise.reject(new errors.ArgumentError('parentFolder', 'fileSystemService.getChildren', parentFolder, 'folder object'));
        }

        var params = {
            depth: 1
        };

        var request = {
            type: wixCodeUtils.requestTypes.GET
        };
        return sendRequest(request, codeAppInfo, parentFolder.location, params)
            .then(extractChildren);
    }

    function getMetadata(codeAppInfo, fileSystemItem) {
        if (!isFileSystemItem(fileSystemItem)) {
            return Promise.reject(new errors.ArgumentError('fileSystemItem', 'fileSystemService.getMetadata', fileSystemItem, 'file system object'));
        }

        var params = {
            parts: 'meta'
        };

        var request = {
            type: wixCodeUtils.requestTypes.GET
        };

        return sendRequest(request, codeAppInfo, fileSystemItem.location, params).then(ensureDescriptorWithShortLocationFormat);
    }

    function readFile(codeAppInfo, file) {
        //TODO: handle acceptPatch
        if (!isFile(file)) {
            return Promise.reject(new errors.ArgumentError('filePath', 'fileSystemService.readFile', file, 'file object'));
        }

        var request = {
            type: wixCodeUtils.requestTypes.GET
        };

        return sendRequest(request, codeAppInfo, file.location);
    }

    function overrideFileContent(codeAppInfo, file, content) {
        if (!isValidContent(content)) {
            return Promise.reject(new errors.ArgumentError('content', 'fileSystemService.overrideFileContent', content, 'string'));
        }

        var headers = {
            'If-Match': file.eTag
        };

        var request = {
            type: wixCodeUtils.requestTypes.PUT,
            headers: headers,
            contentType: CONTENT_TYPE_PLAIN_TEXT,
            log: false,
            data: content
        };

        return sendRequest(request, codeAppInfo, file.location).then(ensureDescriptorWithShortLocationFormat);
    }

    function patchFileContent(codeAppInfo, file, partialChange) {
        if (!isValidPartialChange(partialChange)) {
            return Promise.reject(new errors.ArgumentError('partialChange', 'fileSystemService.patchFileContent', partialChange, 'partial change with diff object'));
        }

        var headers = {
            'X-HTTP-Method-Override': 'PATCH',
            'If-Match': file.eTag
        };

        var request = {
            type: wixCodeUtils.requestTypes.POST,
            headers: headers,
            contentType: CONTENT_TYPE_PLAIN_TEXT,
            log: false,
            data: JSON.stringify(partialChange)
        };
        return sendRequest(request, codeAppInfo, file.location).then(ensureDescriptorWithShortLocationFormat);
    }

    function writeFile(codeAppInfo, file, content) {
        if (!isFile(file)) {
            return Promise.reject(new errors.ArgumentError('filePath', 'fileSystemService.writeFile', file, 'file object'));
        }
        if (!isValidContent(content) && !isValidPartialChange(content)) {
            return Promise.reject(new errors.ArgumentError('content', 'fileSystemService.writeFile', content, 'string or partial-change object'));
        }
        return (typeof content === 'string') ? overrideFileContent(codeAppInfo, file, content) : patchFileContent(codeAppInfo, file, content);
    }

    function getVirtualDescriptor(codeAppInfo, fullName, isDirectory) {
        var name = stripLastPathSeperatorIfExists(fullName);
        name = name.split(PATH_SEPARATOR).pop();

        return {
            virtual: true,
            localTimeStamp: 0,
            eTag: '"virtual"',
            name: name,
            length: 0,
            directory: isDirectory,
            location: fullName + (isDirectory ? PATH_SEPARATOR : ''),
            attributes: {
                readOnly: false
            }
        };
    }

    function getFileDescriptorFromServer(codeAppInfo, fileName) {
        if (typeof fileName !== 'string') {
            return Promise.reject(new errors.ArgumentError('file', 'fileSystemService.getFileDescriptorFromServer', fileName, 'file name'));
        }

        var virtualDescriptor = getVirtualDescriptor(codeAppInfo, fileName, false);

        return getMetadata(codeAppInfo, virtualDescriptor).catch(handle404);

        function handle404(response) {
            if (response.status !== 404) {
                return Promise.reject(new errors.FileSystemError('Failed to get file metadata: ' + fileName));
            }

            return virtualDescriptor;
        }
    }

    function getFileDescriptor(codeAppInfo, descriptorOrName) {
        if (_.isObject(descriptorOrName)) {
            //this a valid file descriptor
            return Promise.resolve(descriptorOrName);
        }

        return getFileDescriptorFromServer(codeAppInfo, descriptorOrName);
    }

    function read(codeAppInfo, descriptorOrName, initialDefaultContent) {
        var result = {};
        var defaultContent = initialDefaultContent || '';

        return getFileDescriptor(codeAppInfo, descriptorOrName)
            .then(readFileIfExists)
            .then(setContent)
            .catch(handleReadFailure);

        function readFileIfExists(file) {
            result.file = file;
            return file.virtual ? defaultContent : readFile(codeAppInfo, file);
        }

        function setContent(content) {
            result.content = content;
            return result;
        }

        function handleReadFailure(e) {
            return Promise.reject(new errors.FileSystemError('Failed to read file: ' + descriptorOrName + '\nDetails: ' + JSON.stringify(e)));
        }
    }

    function getRoots(codeAppInfo) {
        return {
            schemas: getVirtualDescriptor(codeAppInfo, SCHEMAS_FOLDER_NAME, true),
            public: getVirtualDescriptor(codeAppInfo, PUBLIC_FOLDER_NAME, true),
            backend: getVirtualDescriptor(codeAppInfo, BACKEND_FOLDER_NAME, true)
        };
    }

    return {
        getRoots: getRoots,
        createFolder: createFolder,
        createFile: createFile,
        create: create,
        deleteItem: deleteItem,
        copy: copy,
        move: move,
        getChildren: getChildren,
        getMetadata: getMetadata,
        readFile: readFile,
        writeFile: writeFile,
        read: read,
        getVirtualDescriptor: getVirtualDescriptor
    };

});
