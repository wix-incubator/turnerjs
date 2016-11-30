import _ from 'lodash';

const clone = (prop, deepKey, checker = (val, path) => val, path = []) => {
    if (_.isEqual(deepKey.join('.'), path.join('.'))) return checker(prop, path);
    if (_.isArray(prop)) {
        return prop.map((i, ind)=> clone(i, deepKey, checker, [...path, ind]));
    } else if(_.isObject(prop)) {
        let newObj = {};
        for (let i in prop){
            if(prop.hasOwnProperty(i)){
                newObj[i] = clone(prop[i], deepKey, checker, [...path, i])
            }
        }
        return newObj;
    } else {
        return checker(prop, path);
    }
};

export const changeDeepProperty = _.curry(function (deepKey, value, product) {
    return clone(product, deepKey.split('.'), (val, path) => {
        if (_.isEqual(deepKey, path.join('.'))) {
            return value
        } else {
            return val;
        }
    });
});