var request = require('request');
var parser = require('xml2json');

function downloadFile(url, targetFileName, callback) {
    var wget = require('wget');
    var download = wget.download(url, targetFileName);
    download.on('error', function(err){
        callback({error: err});
    });
    download.on('end', function() {
        callback(url);
    });
}

module.exports = {
    downloadArtifact: function (artifactName, onComplete) {
        var http = require('http');
        var fs = require('fs');

        var artifactMavenMetadataPath = 'http://repo.dev.wix/artifactory/libs-snapshots/com/wixpress/html-client/' + artifactName + '/maven-metadata.xml';
        console.log('Getting: ' + artifactMavenMetadataPath);
        request.get(artifactMavenMetadataPath, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log('Downloaded: ' + artifactMavenMetadataPath);
                var json = parser.toJson(body);
                var artifactMavenMetadata = JSON.parse(json);
                var snapshotVersion = artifactMavenMetadata.metadata.versioning.latest;
            }

            var artifactSnapshotMetadataPath = 'http://repo.dev.wix/artifactory/libs-snapshots/com/wixpress/html-client/' + artifactName + '/' + snapshotVersion + '/maven-metadata.xml';
            console.log('Getting: ' + artifactSnapshotMetadataPath);
            request.get(artifactSnapshotMetadataPath, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    console.log('Downloaded: ' + artifactSnapshotMetadataPath);
                    var json = parser.toJson(body);
                    var snapshotVersionMetadata = JSON.parse(json);
                    var versions = snapshotVersionMetadata.metadata.versioning.snapshotVersions.snapshotVersion;
                    var version = versions[versions.length - 1];
                    var artifactTarballPath = 'http://repo.dev.wix/artifactory/libs-snapshots/com/wixpress/html-client/' + artifactName + '/' + snapshotVersion + '/' + artifactName + '-' + version.value + '.tar.gz';

                    console.log('Getting: ' + artifactTarballPath);
                    downloadFile(artifactTarballPath , artifactName + '-snapshot.tar.gz', function(result) {
                        if (result.error) {
                            console.log('Error while downloading file!', result.error);
                            throw result.error;
                        }

                        console.log('Downloaded as: ' + result);
                        onComplete(result);
                    });
                }
            });
        });
    },

    getArtifactRcVersion: function(artifactName, onComplete){
        var artifactMavenMetadataPath = 'http://repo.dev.wix/artifactory/libs-releases/com/wixpress/html-client/' + artifactName + '/maven-metadata.xml';
        console.log('Getting: ' + artifactMavenMetadataPath);
        request.get(artifactMavenMetadataPath, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var json = parser.toJson(body);
                var artifactMavenMetadata = JSON.parse(json);
                var rcVersion = artifactMavenMetadata.metadata.versioning.latest;
                console.log(artifactName + ' latest RC: ' + rcVersion);
                onComplete(rcVersion);
            }
        });
    }
};