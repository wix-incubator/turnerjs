import _ from 'lodash';

const morf = {
    'array': (source, scheme) => source.map(i => scheme ? getDataByScheme(scheme, i) : i),
    'object': (source, scheme) => scheme ? getDataByScheme(scheme, source) : _.deepClone(source),
    'enumObject': (source, scheme) => scheme ? _.keys(source).reduce((a, i) => (a[i] = getDataByScheme(scheme, source[i]), a), {}): _.deepClone(source),
    'identity': source => source
};

export const getDataByScheme = (scheme, source) => _.keys(scheme).reduce((acc, prop) => {
    if (prop in source) {
        (acc[prop] = (morf[(scheme[prop].type || scheme[prop])] || morf.identity)(source[prop], scheme[prop].scheme));
    }
    return acc;
}, {});

const emptyTypes = {
    'string': (defaultValue) => defaultValue != null ? defaultValue : '',
    'number': (defaultValue) => defaultValue != null ? defaultValue : 0,
    'boolean': (defaultValue) => defaultValue != null ? defaultValue : true,
    'array': (defaultValue, scheme) => scheme ? [generateEmptyDataByScheme(scheme)] : defaultValue != null ? defaultValue : [],
    'object': (defaultValue, scheme) => scheme ? {...generateEmptyDataByScheme(scheme)} : defaultValue != null ? defaultValue : {},
    'enumObject': (defaultValue, scheme) => scheme ? {0:{...generateEmptyDataByScheme(scheme)}} : {0: defaultValue != null ? defaultValue : {}}
};

export const generateEmptyDataByScheme = (scheme, skipDeepFields = []) => _.keys(scheme).reduce((acc, prop) => {
    acc[prop] =  emptyTypes[(scheme[prop].type || scheme[prop])](scheme[prop].defaultValue, !~skipDeepFields.indexOf(prop) ? scheme[prop].scheme : undefined);
    return acc;
}, {});
