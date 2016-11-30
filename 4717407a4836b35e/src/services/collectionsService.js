import httpFacade from '../utils/HttpFacade';
import topology from '../utils/Topology';

function formatRequestParams(sessionObject) {
	return {
		XEcomInstance: sessionObject.session.instance
	}
}

export async function getCollectionsList(session){
	let url = topology.baseUrl + topology.collectionsList;
	let collectionsList = await httpFacade(url, formatRequestParams(session));

	return collectionsList;
}