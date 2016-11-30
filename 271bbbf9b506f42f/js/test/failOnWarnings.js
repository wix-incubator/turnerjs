/* eslint lodash/prefer-includes:0 */
((function (warningsToPass) {
    'use strict';

    function matches(message, pattern) {
        return pattern instanceof RegExp ? pattern.test(message) : message.indexOf(pattern) > -1;
    }

    function notMatches(message, pattern) {
        return !matches(message, pattern);
    }

    function failOnErrorMessage(message) {
        return warningsToPass.every(notMatches.bind(null, message));
    }

    beforeAll(function () { // eslint-disable-line santa/no-jasmine-outside-describe
        var console_error = console.error;
        console.error = function (err) {
            if (failOnErrorMessage(err)) {
                throw new Error('Failure due to warning:\n\n' + err + '\n\n');
            }
            console_error.apply(console, arguments);
        };
    });

})([
    /Warning: ReactClass: prop type `[^`]+` is invalid/,
    /Warning: Failed propType: Required prop `[^`]+`/,
    /Warning: Failed propType: Invariant Violation: [^:]+: prop type `[^`]+` is invalid/,
    'Warning: React attempted to reuse markup in a container but the checksum was invalid.'
    // 'Warning: Failed propType: Required prop',
    // 'Cannot render component',
    // 'Warning: ReactDOMComponent',
    // 'Warning: Failed propType',
    // 'Warning: ReactClass: prop type'
]));
