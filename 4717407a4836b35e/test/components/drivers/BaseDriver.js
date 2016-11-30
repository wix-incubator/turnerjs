import {shallow} from 'enzyme';
const React = require('react-native-mock');

export default class BaseDriver {
  constructor({path, mocks = {}, name = 'default'}) {
    this.loadedComponent = require('proxyquire').noCallThru()(`../../../src/components/${path}`, mocks)[name];
  }
  
  shallow(props) {
    this.component = shallow(<this.loadedComponent {...props}/>);
  }

  byId(testId) {
    const el = this.component.findWhere(node => node.prop('testID') === testId);
    return el;
  }
}