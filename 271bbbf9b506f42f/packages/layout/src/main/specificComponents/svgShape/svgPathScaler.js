/**
 * Created by eitanr on 6/24/14.
 */
define(['lodash', 'layout/specificComponents/svgShape/svgPathParser', 'layout/specificComponents/svgShape/svgBasicScaler', 'utils'], function (_, parser, basic, utils) {
    'use strict';
    var emptyString = function () {
            return '';
        },
        scaleAngleValue = function (value, scaleX, scaleY) {
            return basic.scaleSingleValue(value, (scaleY / (scaleX * 360)));
        },

        scaleArcString = function (commandValues, scaleX, scaleY) {
            if (commandValues.length !== 7) {
                utils.log.verbose('incorrect arc string, should have exactly 7 parameters. (value was ' + commandValues.join(' '));
                return commandValues.join(' ');
            }

            commandValues[0] = basic.scaleSingleValue(commandValues[0], scaleX);
            commandValues[1] = basic.scaleSingleValue(commandValues[1], scaleY);
            commandValues[2] = scaleAngleValue(commandValues[2], scaleX, scaleY);
            commandValues[5] = basic.scaleSingleValue(commandValues[5], scaleX);
            commandValues[6] = basic.scaleSingleValue(commandValues[6], scaleY);

            return commandValues.join(' ');
        },

        scaleMultipleArcString = function (arcString, scaleX, scaleY) {
            var commandValues = arcString.split(/[\s,]+/);
            var commandChunks = _.chunk(commandValues, 7);
            var commandMultipleValues = [];

            _.forEach(commandChunks, function (commandValueArr) {
                commandMultipleValues.push(scaleArcString(commandValueArr, scaleX, scaleY));
            });

            return commandMultipleValues.join(' ');
        },

        scale = function (pathElement, scaleX, scaleY) {
            var parsedPath = parser.getParsedPath(pathElement.getAttribute('d'));
            _.forEach(parsedPath, function (commandValueArr) {
                var args = [commandValueArr[1]],
                    pathFunction = commandValueArr[0].toUpperCase();

                if (pathFunction === 'V') {
                    args.push(scaleY);
                } else if (pathFunction === 'H') {
                    args.push(scaleX);
                } else {
                    args.push(scaleX);
                    args.push(scaleY);
                }
                commandValueArr[1] = scalers[commandValueArr[0].toUpperCase()].apply(null, args);
            });
            //return {d: parser.stringifyParsedPath(parsedPath)};

            pathElement.setAttribute('d', parser.stringifyParsedPath(parsedPath));
        },
        scalers = {
            M: basic.scaleMultiplePairStrings,
            L: basic.scaleMultiplePairStrings,
            H: basic.scaleMultipleSingleStrings,
            V: basic.scaleMultipleSingleStrings,
            Z: emptyString,
            C: basic.scaleMultiplePairStrings,
            S: basic.scaleMultiplePairStrings,
            Q: basic.scaleMultiplePairStrings,
            T: basic.scaleMultiplePairStrings,
            A: scaleMultipleArcString
        };

    return {
        scale: scale
    };
});
