import biLogger from 'mobile-bi-logger';

const isCI = Boolean(process.env.IS_BUILD_AGENT);
const isTestEnv = __DEV__ || isCI;

const defaults = {
    src: 10,
    appName: 'wixstore'
};

const events = {
    TAB_CLICKED: {evid: 311},
    PRODUCT_CLICKED: {evid: 362},
    UPDATE_PRODUCT_CLICKED: {evid: 367},
    ADD_NEW_PRODUCT_CLICKED: {evid: 361},
    ORDER_STATUS_CHANGED: {evid: 414},
    EDIT_PRODUCT_CLICKED: {evid: 369}, //only mobile
    ORDER_CONTACT_BUYER: {evid: 415}
};

export default biLogger({defaults, events, isTest: isTestEnv, queue: null, path: 'ec'});
export {
    events as biEvents
};