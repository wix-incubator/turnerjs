define(['lodash',
    'experiment',
    'documentServices/documentServicesDataFixer/fixers/fiveGridLineFullWidthFixer',
    'documentServices/documentServicesDataFixer/fixers/designDuplicateIdsDataFixer'],
    function (_, experiment, fiveGridLineFullWidthFixer, designDuplicateIdsDataFixer) {
        'use strict';

        var fixers = _.compact([
            fiveGridLineFullWidthFixer,
            designDuplicateIdsDataFixer
        ]);

        function fix(ps) {
            _.forEach(fixers, function (fixer) {
                fixer.exec(ps);
            });
        }

        return {
            fix: fix
        };
    });
