import httpFacade from '../utils/HttpFacade';
import topology from '../utils/Topology';

function formatRequestParams(sessionObject) {
    return {
        XEcomInstance: sessionObject.session.instance
    }
}

export async function getStoreSettings(session){
    let url = topology.baseUrl + topology.storeSettings;
    let settings = await httpFacade(url, formatRequestParams(session));

    return settings;
}
