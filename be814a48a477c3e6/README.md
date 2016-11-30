# Platform Integration

Integration tests infra on top of a Protractor web driver.
Knows how to run Jasmine tests directly and report specs status of a loaded Jasmine tests.

## Install
```
git clone git@github.com:wix-private/js-platform-integartion.git
npm install
npm run build
```

## Run remote tests

This will run the tests using `browserstack` and `saucelabs`
```
npm test
```

## Local Selenium Driver

start your Selenium Webdriver in a terminal
```
npm run wdm
```

run tests
```
npm run test:local_selenium
```

note that this will run with the runners in the S3 bucket

## Local Santa (+ tests)

verify local santa is running

start your Selenium Webdriver in a terminal
```
npm run wdm
```

start your local server in another terminal to serve the runners
```
npm run server
```

run tests
```
npm run test:local_all
```

## TL;DR

### how integration tests bootstrap

passing query param `isPlatformIntegration=true` will start the integration tests:

* it will load the platformIntegrationEditor package + dependencies ([see santa-editor/../runEditor.js](https://github.com/wix-private/santa-editor/blob/platfrom-integration/app/partials/runEditor.js)) 
* it will initialize platformIntegrationEditor ([see santa-editor/../editorMain.js](https://github.com/wix-private/santa-editor/blob/master/packages/rEditor/src/main/rootComps/editorMain.js)) 
* which will register to `documentServicesLoaded` event. onEvent:
    * initialize the drivers (platformIntegrationEditor.js)
    * require the runners - RequireJS knows where they are ([see santa-editor/app/rjs-config.js](https://github.com/wix-private/santa-editor/blob/platfrom-integration/app/rjs-config.js)) 
    * start jasmine


### Project Structure

```
.
├── config - grunt related configurations and tasks
│   ├── grunt
│   ├── lib
│   ├── protractor
│   └── tasks
├── runners
│   └── platformIntegrationEditor - the package to be imported by Editor
│       └── src
│           └── main
│               ├── drivers - wrappers for editorAPI and platformAPI
│               ├── runners - the jasmine tests
│               └── utils
├── server - to locally serve the runners while writing new runners
└── spec - the main protractor spec, dynamically loads runners
```
