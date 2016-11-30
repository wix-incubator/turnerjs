var fs = require('fs');
var path = require('path');
var resemble = require('node-resemble-js');
var PNGCrop = require('png-crop');

var progress = {
    status: 'standby',
    lastCompareData: null
};

var takeSnapshotIfNeeded = function (data) {
    var imagePath = path.resolve('baseImages/' + data.imageName + '.png');
    if (data.shouldTakeSnap) {
        progress.status = 'working';
        testImageDiff(imagePath, data, function (compareResult) {
            progress.status = 'done';
            progress.lastCompareData = compareResult;
        });
    }
};

function streamToBuffer(stream, cb) {
    var chunks = [];
    stream.on('data', function (chunk) {
        chunks.push(chunk);
    });
    stream.on('end', function () {
        cb(Buffer.concat(chunks));
    });
}

function getBase64Snapshot (cssSelector, callback) {
    var elem = element(by.css(cssSelector));
    elem.getSize().then(function (size) {
        browser.executeScript("return arguments[0].getBoundingClientRect();", elem.getWebElement()).then(function (rect) {
            browser.takeScreenshot().then(function (data) {
                var buffer = new Buffer(data, 'base64');
                var config = {
                    width: size.width,
                    height: size.height,
                    left: Math.floor(rect.left),
                    top: Math.floor(rect.top)
                };

                PNGCrop.cropToStream(buffer, config, function (err, stream) {
                    if (err) {
                        throw err;
                    }
                    streamToBuffer(stream, callback);
                });
            });
        });
    });
}

function testImageDiff(baseImgPath, data, callback) {
    getBase64Snapshot(data.elementCssSelector, function (liveSiteScreenshotBuffer) {
        if (data.shouldSaveBaseImage) {
            fs.writeFile(baseImgPath, liveSiteScreenshotBuffer, function(err) {
                if(err) {
                    return console.log(err);
                }
            });
        }

        resemble(baseImgPath).compareTo(liveSiteScreenshotBuffer).onComplete(function (data) {
            var matchPercentage = 100 - parseFloat(data.misMatchPercentage);
            callback({
                matchPercentage: matchPercentage
            });
        });
    });
}

module.exports = {
    takeSnapshotIfNeeded: takeSnapshotIfNeeded,
    progress: progress
};
