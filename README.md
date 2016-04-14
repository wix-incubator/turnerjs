# Angular Components Test Kit

## Watch Talk

Video: https://www.youtube.com/watch?v=SUcaPh4MHes

Slides: https://drive.google.com/a/wix.com/file/d/0BxJZ7qdtPbeYRU1QdUI3X1Y5WFE/view

## Overview
Component tests allows testing the UI (provided that it is build as components/directives of course) in order to get instant feedback and minimize the use of protractor.

The test kit provides a base driver utility class - **WixComponentTestDriver**, which allows writing tests using typescript in order to test components in a more readable, maintainable and quicker manner,
It provides basic methods to allow rendering a template, accessing underlying elements and ability to maintain drivers' hierarchy, in order to be able to reuse drivers in parent components.

## Installation
1. Include ```'app/bower_components/wix-angular/dist/test/lib/spec/turner-driver.js'``` in your karma.conf file
2. Add ```"bower_components/wix-angular/dist/test/lib/spec/turner-driver.d.ts"``` to your **tsconfig.json** 

## Usage
* Create a driver that extends the base driver and implement the methods that are required for your tests, for example (in the spec file or elsewhere):

```javascript
   class ExampleComponentDriver extends WixComponentTestDriver {
           
        constructor() {
          super();
        }
      
        render(param1, param2) {
          //renders the template and adds the input parameters as scope params (second argument to renderFromTemplate method)
          //passing a selector is needed when the element containing the directive is not the first element in the template or when there is more than one driver
          this.renderFromTemplate('<example-component another-attribute="param2"><div data-hook="inner-element">{{param1}}</div></example-component>', {param1, param2}, 'example-component');
        }
      
        isInnerElementValid(): boolean {
           return this.findByDataHook('inner-element').text() === 'valid';
        }
      }
```

* Write tests that utilizes the driver

```javascript
    let driver: ExampleComponentDriver;
    beforeEach(() => {
       driver = new ExampleComponentDriver();
       driver.render('valid', 'yada yada');
       driver.connectToBody();
    });
   
    afterEach(() => {
        driver.disconnectFromBody();
    });
    
    it('should contain a valid element value', () => {
        expect(driver.isInnerElementValid()).toBeTruthy();
    });
```

## Global Methods added by the test kit
|Param|Type|Arguments|Details|
|---|---|---|---|
|byDataHook|global method|dataHook: string|Create a data-hook selector it is useful for methods that uses selectors such as ***WixComponentTestDriver.defineChild***|

## Base Driver Methods/ Members
|Param|Type|Arguments|Details|
|---|---|---|---|
|constructor|Constructor|N/A|Creates the driver|
|renderFromTemplate|protected method|**template**: string, **args**?: Object, **selector**?: string|Allows rendering the component/directive, the args is a key value pairs object that will be added to the scope of the element, initializes the root of the driver according to the selector |
|findByDataHook|protected method|**dataHook**: string|a utility method that should be used by drivers that inherits from the base driver in order to select an element (first if there are several) by **data-hook** attribute. It will throws an error if called before ***renderFromTemplate*** was called|
|findAllByDataHook|protected method|**dataHook**: string|similar to ***findByDataHook*** but allows selecting several elements with the same **data-hook**|
|defineChild|protected method|**childDriver**: Instance of T such that T extends **WixComponentTestDriver**, **selector**: string representing a CSS selector (preferably called with ***byDataHook(dataHook)***)|Declare a child driver of the current driver, allows components hierarchy, which is also returned by the method. This method should be called before ***renderFromTemplate*** was called|
|defineChildren|protected method|**factory**: function that returns an instance of T such that T extends **WixComponentTestDriver**, **selector**: string representing a CSS selector (which is expected to return more than one result)|returns an array of child drivers (instances of T), it is useful when there is more than one child driver for parent driver (e.g. ng-repeat), the returned array will change when there is a change in the number of elements in the dom. This method should be called before ***renderFromTemplate*** was called|
|applyChanges|public method|N/A|invokes $rootScope.$digest(), mainly aimed to 'hide' *AngularJS* related implementation|
|connectToBody|public method|N/A|Connects the template to the karma's browser body - allows height/width related tests. ***disconnectFromBody*** has to be called at the end of the test. It will thorw an error if called before ***renderFromTemplate*** was called|
|disconnectFromBody|public method|N/A|Clears the the body of the karma's browser, used in order to reset the browser to the original state prior to starting the next test|
|afterRender|protected method|N/A|You can override this method if you need extra setup after render|
|element|ng.IAugmentedJQuery|N/A|Reference to the element that represents the root of the driver (by selector if provided or template root)|
|scope|ng.IScope|N/A|Reference to the scope of ***element*** member|
|isRendered|boolean|N/A|defines whether the driver is rendered - whether its template was rendered and its scope is valid (defined and part of the dom)|
|appendedToBody|boolean|N/A|defines whether the driver's element is appended to body (e.g. a driver for bootstrap tooltip)|
|$rootScope|ng.IRootScopeService|N/A|Reference to the **$rootScope** service (removes the need to inject it in tests)|

## Nested drivers
In order to allow reuse of drivers, the base driver supports initializing any child element (member) that extends **WixComponentTestDriver**
For example, assuming 3 components are defined:
```javascript
   angular.module('myModule', []);
   class ItemComponentCtrl {
     public item: {value: number};

     isValid():  boolean {
       return this.item.value > 1;
     }
   }
   
   angular
     .module('myModule')
     .component('itemComponent', {
       template: `<div data-hook="item-element" ng-class="{'valid': $ctrl.isValid()}"/>`,
       controller: ItemComponentCtrl,
       bindings: {
         item: '='
       }
     });
   
   class IndividualComponentCtrl {
     public item: {value: number};

     getText():  string {
       return this.item.value > 1 ? 'valid' : 'invalid';
     }
   }
   
   angular
     .module('myModule')
     .component('individualComponent', {
       template: `<div data-hook="inner-element">{{$ctrl.getText()}}</div>`,
       controller: IndividualComponentCtrl,
       bindings: {
         item: '='
       }
     });
   
   class ParentComponentCtrl {
     public items: {value: number}[];
   
     constructor() {
       this.items = [];
       for (let i = 0; i < 5; i++) {
         //push either 1 or 2
         this.items.push({
           value: Math.floor((Math.random() * 2) + 1)
         });
       }
     }
   }
   
   angular
     .module('myModule')
     .component('parentComponent', {
       template: `<div>
                    <individual-component item="$ctrl.items[0]"/>
                    <item-component ng-repeat="item in $ctrl.items" item="item"/>
                  </div>`,
       controller: ParentComponentCtrl
     });

```

3 Drivers that corresponds to each are defined:
(When there is a list of child drivers - e.g. when using ng-repeat, **defineChildren** method should be used in order to declare an array of child drivers)
```javascript
  
class IndividualComponentDriver extends WixComponentTestDriver {

  constructor() {
    super();
  }

  render(item) {
    this.renderFromTemplate('<individual-component item="item"/>', {item});
  }

  isValid(): boolean {
    return this.findByDataHook('inner-element').text() === 'valid';
  }
}

class ItemComponentDriver extends WixComponentTestDriver {

  constructor() {
    super();
  }

  render(item) {
    this.renderFromTemplate('<item-component item="item"/>', {item}, 'item-component');
  }

  isValid(): boolean {
    return this.findByDataHook('item-element').hasClass('valid');
  }
}

class ParentComponentDriver extends WixComponentTestDriver {
  public innerComponent: IndividualComponentDriver;
  public itemComponents: ItemComponentDriver[];

  constructor() {
    super();
    this.innerComponent = this.defineChild(new IndividualComponentDriver(), 'individual-component');
    this.itemComponents = this.defineChildren(() => new ItemComponentDriver(), 'item-component');
  }

  render() {
    this.renderFromTemplate(`<parent-component>`);
  }

  isIndividualValid(): boolean {
    return this.innerComponent.isValid();
  }

  isItemsValid(): boolean {
    let result = true;
    this.itemComponents.forEach(itemDriver => {
      result = result && itemDriver.isValid();
    });
    return result;
  }
}
```
**WixComponentTestDriver** will initialize the member's scope & element automatically as soon as the renderFromTemplate method is invoked.
The above drivers will allow testing each component separately and also testing the parent component that wraps the two:
```javascript
describe('Usage Examples when there are repeatable drivers', () => {
    let parentComponentDriver: ParentComponentDriver;
    beforeEach(() => {
      module('myModule');
      parentComponentDriver = new ParentComponentDriver();
    });

    it('should be valid when the random values are above 1', () => {
      spyOn(Math, 'random').and.returnValue(0.9);
      parentComponentDriver.render();
      expect(parentComponentDriver.isIndividualValid()).toBe(true);
      expect(parentComponentDriver.isItemsValid()).toBe(true);
    });
  });
```

#### Credits

Alon Yehezkel
Shahar Talmi
Boris Litvinski
Amit Shvil

