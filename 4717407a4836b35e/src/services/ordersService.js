import httpFacade from '../utils/HttpFacade';
import topology from '../utils/Topology';

function formatRequestParams(sessionObject) {
	return {
		XEcomInstance: sessionObject.session.instance
	}
}

export async function getOrderList(session) {
	let url = topology.baseUrl + topology.orderList;
	return await httpFacade(url, formatRequestParams(session));
}
export async function getDetailedOrder(session, orderId) {
	let url = topology.baseUrl + topology.orderList + orderId;
		//await httpFacade('https://ecom.wix.com/_api/wix-ecommerce-renderer-web/store-manager/order/SetTrackingProperties', formatRequestParams(session), 'POST', {"orderId": orderId,	trackingNumber: '1008345',shippingProvider: 'nove poshta'});

	return await httpFacade(url, formatRequestParams(session));
}
export async function markOrderAsPaid(session, orderId) {
	let url = topology.baseUrl + topology.markOrderAsPaidByStoreManager;
	return await httpFacade(url, formatRequestParams(session), 'POST', {"orderId": orderId});
}
export async function markOrderAsRead(session, orderId) {
	let url = topology.baseUrl + topology.markOrderAsReadByStoreManager;
	return await httpFacade(url, formatRequestParams(session), 'POST', {"orderId": orderId});
}
export async function changeOrderShippingStatus(session, orderId, status) {
	let url = topology.baseUrl + topology.changeShippingStatusByStoreManager;
	return await httpFacade(url, formatRequestParams(session), 'POST', {"orderId": orderId, "status": status});
}

//https://ecom.wix.com/_api/wix-ecommerce-renderer-web/store-manager/order/SetTrackingProperties
//{
//	orderId: '',
//	trackingNumber: '',
//	shippingProvider: 'nove poshta'
//}