define(['lodash', 'coreUtils'], function (_, coreUtils) {
    'use strict';

    describe('log', function () {

        beforeEach(function () {
            spyOn(console, 'log');
            spyOn(console, 'warn');
            spyOn(console, 'error');
        });

        function requireLogger(isDebugMode, callback) {
            requirejs.undef('loggingUtils/log/log');
            spyOn(coreUtils.urlUtils, 'parseUrl').and.callFake(function () {
                return {query: {debug: isDebugMode ? 'all' : ''}};
            });
            require(['loggingUtils/log/log'], callback);
        }

        describe('debug enabled', function () {

            beforeEach(function (done) {
                requireLogger(true, function (logger) {
                    this.log = logger;
                    done();
                }.bind(this));
            });

            it('should output to log when verbose called', function () {
                this.log.verbose(null, 1, 'test', [], {error: 404, message: 'not found'});
                expect(console.log).toHaveBeenCalledWith(null, 1, 'test', [], {error: 404, message: 'not found'});
            });

            it('should output to log when log called', function () {
                this.log.info('info');
                expect(console.log).toHaveBeenCalledWith('info');
            });

            it('should output to warn when warn called', function () {
                this.log.warn('warning!');
                expect(console.warn).toHaveBeenCalledWith('warning!');
            });

            it('should output to error when error called', function () {
                this.log.error({error: 404, message: 'not found'});
                expect(console.error).toHaveBeenCalledWith({error: 404, message: 'not found'});
            });
        });

        describe('debug disabled', function () {

            beforeEach(function (done) {
                requireLogger(false, function (logger) {
                    this.log = logger;
                    done();
                }.bind(this));
            });

            it('should not output to log when verbose called', function () {
                this.log.verbose('test');
                expect(console.log).not.toHaveBeenCalled();
            });

            it('should output to log when log called', function () {
                this.log.info('test', 'info');
                expect(console.log).toHaveBeenCalledWith('test', 'info');
                this.log.info();
                expect(console.log).toHaveBeenCalledWith();
            });

            it('should output to warn when warn called', function () {
                this.log.warn('warning!');
                expect(console.warn).toHaveBeenCalledWith('warning!');
                this.log.warn();
                expect(console.warn).toHaveBeenCalledWith();
            });

            it('should output to error when error called', function () {
                this.log.error('error');
                expect(console.error).toHaveBeenCalledWith('error');
                this.log.error();
                expect(console.error).toHaveBeenCalledWith();
            });
        });

    });

});

