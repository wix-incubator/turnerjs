//import VariantInputFormLine from '../drivers/dumb/VariantInputFormLine.driver';
//
//describe('<VariantInputFormLine />', () => {
//  let driver;
//  beforeEach(() => {
//    driver = new VariantInputFormLine();
//  });
//
//  it('should call onChange callback when pressed', () => {
//    let onChangeSpy = jasmine.createSpy('onChangeSpy');
//
//    driver
//      .given.onChange(onChangeSpy)
//      .given.value(false)
//      .when.shallowed()
//      .when.togglePressed();
//
//    expect(onChangeSpy).toHaveBeenCalled();
//  });
//
//  it('should set correct title', () => {
//    const title = 'Title';
//    driver.given.title('Title').when.shallowed();
//    expect(driver.get.labelText()).toBe(title);
//  });
//});