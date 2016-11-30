import httpFacade from '../utils/HttpFacade';
import topology from '../utils/Topology';

function formatRequestParams(sessionObject) {
	return {
		XEcomInstance: sessionObject.session.instance
	}
}

export async function getProductList(session){
	let url = topology.baseUrl + topology.productsList;
	let productList = await httpFacade(url, formatRequestParams(session));

	return productList;
}
export async function getDetailedProduct(session, productID){
	let url = topology.baseUrl + topology.productsList + productID;
	let product = await httpFacade(url, formatRequestParams(session));

	return product;
}

export async function executeCommands(session, commands, productID) {
	commands.forEach((comm) => {
		comm.data.id = productID
	});

	let url = topology.baseUrl + topology.executeCatalogCommands;
	let res = await httpFacade(url, formatRequestParams(session), 'POST', {"commands": commands});

	return res;
}

export async function productAndCollection(session, productID, collections, add = true){
	let url = topology.baseUrl + (add ? topology.productToCategory : topology.productFromCategory);
	try {
		//speed optimization
		await httpFacade(url, formatRequestParams(session), 'POST', {id: productID, categoryId: collections[0]});
		const restCollections = collections.slice(1);

		for(let i = 0; i < restCollections.length; i++) {
			httpFacade(url, formatRequestParams(session), 'POST', {id: productID, categoryId: restCollections[i]});
		}
	} catch(e) {

    }
}