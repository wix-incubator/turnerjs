import _ from 'lodash/fp';
import { diffRules } from '../transformers/cqrsDiffRules';
import * as cqrsCommands from '../transformers/cqrsCommands';
import { getDataByScheme } from './CloneByScheme';

export default (initialProduct, editProduct, scheme) => {
    const baseProduct = scheme ? getDataByScheme(scheme, initialProduct) : initialProduct;

    return _.keys(baseProduct).reduce((commands, key) => {
        if (diffRules[key]) {
            let diff = diffRules[key](baseProduct[key], editProduct[key]);
            if (diff && !_.isEmpty(diff) && cqrsCommands[key]) {
                let res = cqrsCommands[key](diff, editProduct[key]);

                return [...commands, ...(_.isArray(res) ? res : [res])]
            }
        }

        return _.compose(
            _.map(comm => _.omit('priority')(comm)),
            _.sortBy('priority')
        )(commands);
    }, []);
}