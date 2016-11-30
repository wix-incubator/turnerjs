
# Wix One App Wix Stores Module

module written according to the [module proposal](https://github.com/wix/wix-react-native-modules)

Originally forked from [wix-react-native-seed-project](https://github.com/wix/wix-react-native-seed-project/). To pull updates from wix-react-native-seed-project, add its repo as a git remote named `upstream`.

#### npm@3

> Note: the testing framework is currently incompatible with npm@3, you can remove everything in `devDependencies` except `react-native` to fix it, or try the workaround below:

* `npm install`
* Make sure you have npm@2 too (`npm install -g npm-2`)
* `npm-2 install`
* Open `ios/example.xcodeproj` in Xcode and execute

#### npm@2

> Note: redux causes some collisions since it's currently incompatible with npm@2, you can use the workaround below:

* `npm install`
* `npm run fix_npm2`
* Open `ios/example.xcodeproj` in Xcode and execute

## Publishing to NPM

To be embedded in hosts like One App, this package needs to be published:

* Make sure you've set up the [Wix private NPM repo](https://kb.wixpress.com/pages/viewpage.action?title=Using+private+npm+registry)
* `npm publish`

## Directory Structure

* `src/` - all of the package code is in here, the main file is [src/module.js](https://github.com/wix/wix-one-app-module-example/blob/master/src/module.js)
* `ios/` - demo project for iOS, the main demo file is [index.ios.js](https://github.com/wix/wix-one-app-module-example/blob/master/index.ios.js)

Note: `ios/`, `android/`, `index.ios.js`, `index.android.js` are parts of the demo project and aren't published
