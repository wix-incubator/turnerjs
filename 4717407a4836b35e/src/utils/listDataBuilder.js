import _ from 'lodash/fp';
import getInventoryStatus from './getInventoryStatus';

const defaultCollection = '00000000-000000-000000-000000000001';

export const transformData = (key) => (data, searchString) => {
    if(!data || !_.keys(data).length) return {};

    const _data = _.filter((item) => !!~item[key].toString().toLowerCase().indexOf(searchString.toLowerCase()), data);
    return _data.reduce((acc, d) => (acc[d.id] = d, acc), {});
};

export const transformDataOrders = (data, searchString) => {
    if(!data || !_.keys(data).length) return {};
    const _data = _.filter((item) => {
        return !!~item.incrementId.toString().toLowerCase().indexOf(searchString.toLowerCase()) || (item.userInfo && item.userInfo.name && !!~item.userInfo.name.toLowerCase().indexOf(searchString.toLowerCase()));
    }, data);

    return _data.reduce((acc, d) => (acc[d.id] = d, acc), {});
};

export function productFilterFunction (collections, _selectedCollectionIndex, addProduct, outOfStock) {

    let selectedCollectionIndex = _selectedCollectionIndex;

    return function (data, searchString, optionalSelectedCollectionIndex) {

        if (optionalSelectedCollectionIndex) {
            selectedCollectionIndex = optionalSelectedCollectionIndex;
        }

        let _data = !outOfStock ? {...data} : {..._.filter(product => !getInventoryStatus(product.inventory, product.managedProductItemsSummary).isOutOfStock)(data)};

        if (collections && collections[selectedCollectionIndex]) {
            _data = collections[selectedCollectionIndex].productIds.reduce((acc, productId) => {
                if (data[productId]) {
                    acc[productId] = data[productId]
                }
                return acc;
            }, {});
        }

        let allData = {
            [selectedCollectionIndex]: _data
        };

        if (searchString && defaultCollection !== selectedCollectionIndex) {
            allData[defaultCollection] = _.xor(_.keys(_data), _.keys(data)).reduce((acc, productId) => {
                if (data[productId]) {
                    acc[productId] = data[productId]
                }
                return acc;
            }, {});
        }

        let ids;

        if (!searchString) {
            ids = getKeys(allData, data => _.keys(data));

            if (addProduct) {
                allData[selectedCollectionIndex]['add_product'] = generateMock('add_product');
                ids[selectedCollectionIndex].unshift('add_product');
            }
        } else {
            ids = getIds(allData, searchString, ['name'], _.orderBy(['name'])(['asc']));
        }

        _.keys(allData).forEach((key) => {
            if (_.keys(allData[key]).length % 2 > 0) {
                allData[key]['empty_cell_' + key] = generateMock('empty_cell_' + key);
                ids[key].push('empty_cell_' + key);
            }
        });

        return listDataBuilder(allData, ids);
    };
}


export const orderFilterFunction = (data, searchString) => {
    let _data = {...data};

    let allData = {
        unfulfilled: _.filter(item => !(item.shippingInfo.status === 'fulfilled'))(_.values(_data)).reduce((acc, n) => (acc[n.id] = n, acc),{}),
        fulfilled: _.filter(item => (item.shippingInfo.status === 'fulfilled'))(_.values(_data)).reduce((acc, n) => (acc[n.id] = n, acc),{})
    };

    let ids = getIds(allData, searchString || '', ['userInfo.name', 'incrementId'], _.orderBy(['createdDate'])(['desc']));

    return listDataBuilder(allData, ids)
};


//Utils
const filterAndSort = (_values, fields, searchString, sortfn) => {

    const values = sortfn(_values);

    let startWith = _.filter(item => {
        return fields.map(f => _.get(f)(item)).some(f => (f || "").toString().toLowerCase().startsWith(searchString.toLowerCase()));
    })(values);

    let contains = _.filter(item => {
        return fields.map(f => _.get(f)(item)).some(f => ((f || "").toString().toLowerCase().indexOf(searchString.toLowerCase()) > 0))
    })(values);

    return _.map((item) => item.id)([...startWith, ...contains]);
};

const generateMock = (id) => ({
    discountPercentRate: 0,
    formattedPrice: '',
    id,
    inventory: {},
    isVisible: true,
    mainMedia: {},
    mediaUrl: '',
    name: '',
    price: 0,
    prices: {},
    sku: ''
});


const getKeys = (data, fill) => _.keys(data).reduce((acc, key) => (acc[key] =  fill(data[key]), acc), {});

const getIds = (allData, searchString, fields, sortingFn) => getKeys(allData, data => filterAndSort(_.values(data), fields, searchString, sortingFn));

const listDataBuilder = (allData, ids) => ({
    forList: (max) => {
        let filteredData = _.keys(allData)
            .reduce((acc, nextSection) => (acc.push(_.take(Math.max(max - (_.last(acc) || []).length, 0))(ids[nextSection])), acc), []);

        return [
            allData,
            [..._.keys(allData)].filter((sec, index) => !!filteredData[index].length),
            filteredData.filter((fd, index) => !!fd.length)
        ];
    }
});