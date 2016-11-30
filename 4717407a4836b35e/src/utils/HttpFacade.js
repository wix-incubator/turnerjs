export default async function httpFacade(url, requestParams, method, bodyData) {

    let params = {
        method: method || 'GET',
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-ecom-instance': requestParams.XEcomInstance || ''
        }
    };

    if( bodyData ) {
        params.body = JSON.stringify(bodyData);
    }

    let resp = await fetch(url, params);

    if (!resp.ok) {
        console.log(resp);
      throw new Error('Could not fetch data');
    }

    let data = await resp.json();

    return data;
}

