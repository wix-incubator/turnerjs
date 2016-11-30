import * as fontSizeComparisonTable from 'documentServices/mobileConversion/modules/fontSizeComparisonTable';

var BASELINE_REFERENCE_DATA = [15, 40, 82];

function approxMatchByTwoLines(xVector: number[], yVector: number[], value: number): number {
    var from = {
        x: (value < xVector[1]) ? xVector[0] : xVector[1],
        y: (value < xVector[1]) ? yVector[0] : yVector[1]
    };
    var to = {
        x: (value < xVector[1]) ? xVector[1] : xVector[2],
        y: (value < xVector[1]) ? yVector[1] : yVector[2]
    };
    var m = (from.y - to.y) / (from.x - to.x);
    var n = to.y - to.x * m;
    return value * m + n;
}

function convertSize(fontName: string, fontSize: number): number {
    if (fontSize === 0){
        return 0;
    }

    const comparisonEntry = fontSizeComparisonTable.tableEntries[fontName];
    if (!comparisonEntry){
        return fontSize;
    }

    return approxMatchByTwoLines(comparisonEntry.referencePoints, BASELINE_REFERENCE_DATA, fontSize);
}

export {
    convertSize
}
