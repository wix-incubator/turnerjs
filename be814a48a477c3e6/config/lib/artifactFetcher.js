'use strict'

const rp = require('request-promise')
const parser = require('xml2json')
const wget = require('wget')

const path = require('path')
const logger = require(path.resolve('./spec/specLogger'))

const BASE_SNAPSHOT_URL = 'http://repo.dev.wix/artifactory/libs-snapshots/com/wixpress/html-client'

function getSnapshotMetaDataPath(artifactName, xml) {
    const json = parser.toJson(xml)
    const artifactMavenMetadata = JSON.parse(json)
    const snapshotVersion = artifactMavenMetadata.metadata.versioning.latest
    return `${BASE_SNAPSHOT_URL}/${artifactName}/${snapshotVersion}/maven-metadata.xml`
}

function getArtifactTarballPath(artifactName, xml) {
    const json = parser.toJson(xml)
    const snapshotVersionMetadata = JSON.parse(json)
    const versions = snapshotVersionMetadata.metadata.versioning.snapshotVersions.snapshotVersion
    const version = versions[versions.length - 1]
    const snapshotVersion = `${ version.value.split('-')[0] }-SNAPSHOT`
    return `${BASE_SNAPSHOT_URL}/${artifactName}/${snapshotVersion}/${artifactName}-${version.value}.tar.gz`
}

function downloadFile(url, targetFileName, callback) {
    const download = wget.download(url, targetFileName)

    download.on('error', callback)
    download.on('end', callback)
}

function downloadArtifact(artifactName, onComplete) {
    const artifactMavenMetadataPath = `${BASE_SNAPSHOT_URL}/${artifactName}/maven-metadata.xml`
    logger.log(`Getting: ${artifactMavenMetadataPath}`)

    rp
        .get(artifactMavenMetadataPath)
        .then((body) => {
            logger.log(`Downloaded: ${artifactMavenMetadataPath}`)
            const artifactSnapshotMetadataPath = getSnapshotMetaDataPath(artifactName, body)
            logger.log(`Getting: ${artifactSnapshotMetadataPath}`)
            return rp.get(artifactSnapshotMetadataPath)
        })
        .then((body) => {
            logger.log(`Downloaded snapshot metadata for ${artifactName}`)
            const artifactTarballPath = getArtifactTarballPath(artifactName, body)
            logger.log(`Getting: ${artifactTarballPath}`)
            const targetPath = `${artifactName}-snapshot.tar.gz`

            downloadFile(artifactTarballPath , targetPath, (result) => {
                if (result !== targetPath) {
                    logger.log('Error while downloading file!', result)
                    onComplete(result)
                }
                logger.log(`Downloaded as: ${targetPath}`)
                onComplete()
            })
        })
        .catch(onComplete)
}

module.exports = {
    downloadArtifact
}
