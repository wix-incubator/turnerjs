/*eslint camelcase: 0*/

import biLogger from 'mobile-bi-logger';

const isCI = Boolean(process.env.IS_BUILD_AGENT);
const isTestEnv = __DEV__ || isCI;

const defaults = {
  src: 67
};

const events = {
  camera_uploadPhoto: {evid: 23},
  click_on_edit_photo: {evid: 70},
  click_on_delete_photo: {evid: 71},
  click_on_allow_photo_access_screen: {evid: 37},
  click_on_add_a_photo: {evid: 38}
};

export default biLogger({defaults, events, isTest: isTestEnv, queue: null, path: 'oneapp'});
export {
  events as biEvents
};
