function error(msg, app) {
    console.error(msg, app.applicationId + ' ' + app.appDefinitionId);
}

module.exports = {
    error: error
};
