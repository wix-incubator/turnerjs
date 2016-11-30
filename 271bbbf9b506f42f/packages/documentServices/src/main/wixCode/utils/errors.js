define([], function () {
    'use strict';

    function ArgumentError(name, fullMethodName, value, expectedValue) {
        var expectedValueStr = expectedValue ? 'Expecting ' + expectedValue : '';
        this.name = 'ArgumentError';

        this.message = 'Illegal Argument \'' + name + '\' in ' + fullMethodName + '. \'' + value + '\' is invalid. ' + expectedValueStr + '.';
        this.stack = (new Error()).stack;

    }
    ArgumentError.prototype = Object.create(Error.prototype);
    ArgumentError.prototype.constructor = ArgumentError;

    function FileSystemError(message) {
        this.name = 'FileSystemError';

        this.message = message;
        this.stack = (new Error()).stack;

    }
    FileSystemError.prototype = Object.create(Error.prototype);
    FileSystemError.prototype.constructor = FileSystemError;


    return {
        ArgumentError: ArgumentError,
        FileSystemError: FileSystemError
    };

});
