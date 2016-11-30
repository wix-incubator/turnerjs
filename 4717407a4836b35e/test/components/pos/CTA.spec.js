//import BaseDriver from '../drivers/BaseDriver';
//const React = require('react-native-mock');
//
//export default class CTADriver extends BaseDriver {
//  constructor() {
//    super({
//      path: 'pos/CTA',
//      mocks: {
//        'react-native': React
//      },
//
//      name: 'CTA'
//    });
//
//    this.given = {
//      image: (image) => {
//        this.props = {...this.props, image};
//        return this;
//      },
//      title: (title) => {
//        this.props = {...this.props, title};
//        return this;
//      },
//      subtitle: (subtitle) => {
//        this.props = {...this.props, subtitle};
//        return this;
//      },
//      actionText: (actionText) => {
//        this.props = {...this.props, actionText};
//        return this;
//      },
//      onPress: (onPress) => {
//        this.props = {...this.props, onPress};
//        return this;
//      }
//    };
//    this.when = {
//      shallowed: () => {
//        this.shallow(this.props);
//        return this;
//      },
//      actionPressed: () => {
//        this.get.button().simulate('press');
//        return this;
//      }
//    };
//    this.get = {
//      image: () => this.byId('image'),
//      imageStyle: () => this.get.image().props().style,
//      imageSource: () => this.get.image().props().source,
//      title: () => this.byId('title'),
//      titleText: () => this.get.title().props().children,
//      subtitle: () => this.byId('subtitle'),
//      subtitleText: () => this.get.subtitle().props().children,
//      button: () => this.byId('button'),
//      label: () => this.byId('label'),
//      labelText: () => this.get.label().props().children
//    };
//  }
//}
//
//describe('<CTA />', () => {
//  let driver;
//  beforeEach(() => {
//    driver = new CTADriver();
//  });
//
//  describe('should render component with defined properties', () => {
//    it('with image', () => {
//      const image = {
//        width: 100,
//        height: 100,
//        source: 'some value'
//      };
//      driver
//        .given.image(image)
//        .when.shallowed();
//
//      expect(driver.get.imageSource()).toEqual(image.source);
//      expect(driver.get.imageStyle()).toEqual({width: image.width, height: image.height});
//    });
//
//    it('with title', () => {
//      const title = 'Title';
//      driver
//        .given.title(title)
//        .when.shallowed();
//
//      expect(driver.get.titleText()).toEqual(title);
//    });
//
//    it('with subtitle', () => {
//      const subtitle = 'Subtitle';
//      driver
//        .given.subtitle(subtitle)
//        .when.shallowed();
//
//      expect(driver.get.subtitleText()).toEqual(subtitle);
//    });
//
//    it('with subtitle', () => {
//      const subtitle = 'Subtitle';
//      driver
//        .given.subtitle(subtitle)
//        .when.shallowed();
//
//      expect(driver.get.subtitleText()).toEqual(subtitle);
//    });
//
//    it('with action', () => {
//      const actionText = 'actionText';
//      driver
//        .given.onPress(() => {})
//        .given.actionText(actionText)
//        .when.shallowed();
//
//      expect(driver.get.labelText()).toEqual(actionText);
//    });
//  });
//
//  it('should call callback on action press', () => {
//    let onPressSpy = jasmine.createSpy('onPressSpy');
//    driver
//      .given.onPress(onPressSpy)
//      .given.actionText('Some action')
//      .when.shallowed()
//      .when.actionPressed();
//    expect(onPressSpy).toHaveBeenCalled();
//  });
//});