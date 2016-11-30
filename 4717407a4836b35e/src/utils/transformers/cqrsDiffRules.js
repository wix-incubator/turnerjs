import _ from 'lodash';
const UPDATED = 'updated';
const INC = 'inc';
const DEC = 'dec';
const DELETED = 'deleted';
const ADDED = 'added';

const genericUp = fn => (lhs, rhs) => (lhs !== rhs && fn(lhs, rhs));

const genericArrayDiff = (identifier) => (lhs, rhs) => {
  const ids0 = lhs.map(i => i[identifier]);
  const ids1 = rhs.map(i => i[identifier]);

  const res = [];

  for (let i = 0, j = ids0.length, k = ids1.length; i < j || i < k; i++) {

    ((ids0[i] != null) && ids1.indexOf(ids0[i]) < 0) && res.push([DELETED, lhs.find(c => c[identifier] === ids0[i])]);
    ((ids1[i] != null) && ids0.indexOf(ids1[i]) < 0) && res.push([ADDED, rhs.find(c => c[identifier] === ids1[i])]);

    (ids1.indexOf(ids0[i]) >= 0)
    && !_.isEqual(
      lhs.find(c => c[identifier] === ids0[i]),
      rhs.find(c => c[identifier] === ids0[i])
    )
    && res.push([
      UPDATED,
      rhs.find(c => c[identifier] === ids0[i])
    ]);
  }

  return res.length ? res : false;
};

const propsDiff = (lhs, rhs) => _.xor(_.keys(lhs), _.keys(rhs))
  .reduce((acc, key) => {
    if (!(key in lhs)) {
      acc[key] = [ADDED, rhs[key]]
    } else if (!(key in rhs)) {
      acc[key] = [DELETED, lhs[key]]
    }
    return acc;
  }, {});

const genericObjectsPropDiff = () => (lhs, rhs) => {
  return {
    ..._.keys(lhs).reduce((acc, key) => {
      if ((key in rhs) && (key in diffRules)) {
        let res = diffRules[key](lhs[key], rhs[key]);
        if (!_.isEmpty(res)) {
          acc[key] = res;
        }
      }

      return acc;
    }, {}),
    ...propsDiff(lhs, rhs)
  };
};

const id = genericUp((lhs, rhs) => [UPDATED, rhs]);

const name = genericUp((lhs, rhs) => [UPDATED, rhs]);

const description = genericUp((lhs, rhs) => [UPDATED, rhs]);

const price = genericUp((lhs, rhs) => [UPDATED, rhs]);

const ribbon = genericUp((lhs, rhs) => [UPDATED, rhs]);

const discount = genericObjectsPropDiff();

const mode = genericUp((lhs, rhs) => [UPDATED, rhs]);

const value = genericUp((lhs, rhs) => [UPDATED, rhs]);

const isVisible = genericUp((lhs, rhs) => [UPDATED, rhs]);

const manageProductItems = genericUp((lhs, rhs) => [UPDATED, rhs]);

const trackingMethod = genericUp((lhs, rhs) => [UPDATED, rhs]);

const status = genericUp((lhs, rhs) => [UPDATED, rhs]);

const quantity = genericUp((lhs, rhs) => [(lhs > rhs ? DEC : INC), Math.abs(lhs - rhs)]);

const collections = genericArrayDiff('id');

const media = genericArrayDiff('url');

const inventory = genericObjectsPropDiff();

const managedProductItems = (lhs, rhs) => {
  const added = propsDiff(lhs, rhs);
  const _lhs = {
    ...lhs,
    ..._.keys(added).reduce((acc, key) => {
      if (added[key][0] === ADDED) {
        acc[key] = {
          inventory: {
            quantity: 0,
            status: "in_stock"
          },
          optionsSelections: rhs[key].optionsSelections,
          visibility: 'visible'
        };
      }

      return acc;
    }, {})
  };

  return {
    ..._.keys(_lhs).reduce((acc, key) => {
      if (_lhs[key] && rhs[key]) {
        let res = genericObjectsPropDiff()(_lhs[key], rhs[key]);
        if (!_.isEmpty(res)) {
          acc[key] = res;
        }
      }
      return acc;
    }, {})
  }
};

export const diffRules = {
  id,
  name,
  description,
  price,
  ribbon,
  discount,
  mode,
  value,
  isVisible,
  manageProductItems,
  trackingMethod,
  status,
  quantity,
  collections,
  media,
  inventory,
  managedProductItems,
  propsDiff
};