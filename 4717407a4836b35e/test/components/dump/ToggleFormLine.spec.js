//import ToggleFormLineDriver from '../drivers/dumb/ToggleFormLine.driver';
//
//describe('<ToggleFormLine />', () => {
//  let driver;
//  beforeEach(() => {
//    driver = new ToggleFormLineDriver();
//  });
//
//  it('should call onChange callback when pressed', () => {
//    let onChangeSpy = jasmine.createSpy('onChangeSpy');
//    driver
//      .given.title('safd')
//      .given.onChange(onChangeSpy)
//      .given.value(false)
//      .when.shallowed()
//      .when.togglePressed();
//
//    expect(onChangeSpy).toHaveBeenCalled();
//  });
//});