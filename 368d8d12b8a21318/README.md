# Santa-Integration-Protractor

Integration tests infra on top of a Protractor web driver.
Knows how to run Jasmine tests directly and report specs status of a loaded Jasmine tests.

Currently being used by TPA team.

## Setup
```
npm install
npm install -g protractor
webdriver-manager update
```

## Running a selenium server
```
webdriver-manager start
```

## Usage

###Running Santa (Viewer) tests

For running Santa test suite fully locally, run:
<br>
`npm start serve`
<br>
`protractor config/viewer/localCode.config.js`

For running Santa test suite locally with sources from aws, run:
`protractor config/viewer/local.config.js`

###Running Santa-Editor tests

For running Santa editor test suite fully locally, run:
<br>
`npm start serve`
<br>
`protractor config/editor/localCode.config.js`

For running Santa editor test suite locally with sources from aws, run:
<br>
`protractor config/editor/local.config.js`

###Running RC tests

For running RC suite with local code, run:
<br>
`npm start serve`
<br>
`grunt rc-local-code`
or
<br>
`npm start serve`
<br>
`grunt protractor:rc_suite_local_code`
