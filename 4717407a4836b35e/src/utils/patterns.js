import {Platform} from 'react-native';

export function Bool(options, generator) {
    return {
        get(predicate = false) {
            const result = options[(typeof predicate === 'function' ? predicate(): predicate).toString()];
            return generator(result);
        }
    }
}

export function Case(cases, generator) {
    return {
        get(value) {
            const result = cases(value);
            return result != null ? generator(result) : null
        }
    }
}

export function OS(options, generator) {
    return {
        get() {
            const result = options[Platform.OS] || {};
            return generator(result);
        }
    }
}

export const $ = {
    any: p => p,
    truth: d => !!d,
    falsy: d => !d,
    noProp: prop => p => !(prop in p) || p[prop] == null,
    empty: p => Array.isArray(p)
      ? !p.length
      : (typeof p === 'object')
        ? !Object.keys(p).length
        : false
}

export const match = (...patterns) => data => {
    for (let i = 0; i < patterns.length; i++) {
        if ($.truth(patterns[i][0](data))) {
            return typeof patterns[i][1] === 'function' ? patterns[i][1](data) : patterns[i][1];
        }
    }

    return null;
};