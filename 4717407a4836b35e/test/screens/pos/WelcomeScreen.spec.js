//import {shallow} from 'enzyme';
//const React = require('react-native-mock');
//import CTADriver from '../../components/pos/CTA.spec';
//
//class BaseDriverScreen {
//  constructor({path, mocks = {}}) {
//    this.loadedComponent = require('proxyquire').noCallThru()(`../../../src/screens/${path}`, mocks)['default'];
//  }
//
//  shallow(props) {
//    this.component = shallow(<this.loadedComponent {...props}/>);
//  }
//
//  byId(testId) {
//    const el = this.component.findWhere(node => node.prop('testID') === testId);
//    return el;
//  }
//}
//
//export default class WelcomeScreenDriver extends BaseDriverScreen {
//  constructor() {
//    super({
//      path: 'pos/WelcomeScreen',
//      mocks: {
//        'react': React,
//        'react-native': React,
//        '../../components/pos/CTA': CTADriver,
//        '../../assets/pos/welcome@2x.png': '1'
//      }
//    });
//
//    this.given = {
//      navigator: (navigator) => {
//        this.props = {...this.props, navigator};
//        return this;
//      }
//    };
//    this.when = {
//      shallowed: () => {
//        this.shallow(this.props);
//        return this;
//      },
//      CTAPressed: () => {
//        this.get.CTA().simulate('press');
//        return this;
//      }
//    };
//    this.get = {
//      CTA: () => this.byId('CTA')
//    };
//  }
//}
//
//describe('Welcome Screen', () => {
//  let driver;
//  beforeEach(() => {
//    driver = new WelcomeScreenDriver();
//  });
//
//  it('should call navigator push', () => {
//    let navigatorMock = {
//      push: jasmine.createSpy('pushSpy')
//    };
//    driver
//      .given.navigator(navigatorMock)
//      .when.shallowed()
//      .when.CTAPressed();
//    expect(navigatorMock.push).toHaveBeenCalled();
//  })
//});