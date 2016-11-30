
# Welcome to Santa !

Santa is a [React](http://facebook.github.io/react/) based Viewer.

![](docs/images/santakfir160.jpg)

Read all about it in [the wiki](https://github.com/wix/santa/wiki)

## Before you start
Read and understand these three documents:
* [Santa's readme](https://github.com/wix/santa/blob/master/README.md)
* [Santa-Editor's readme](https://github.com/wix/santa-editor/blob/master/README.md)
* [Santa/Santa-Editor's troubleshooting](https://github.com/wix/santa/wiki/Setting-up-Development-Environment#troubleshooting)

and when something breaks, review them for updates and fixes.

## Pull Requests:
Before submitting a pull request, please make sure:
* A JIRA ticket in Santa or Santa-Editor should be created and assigned to the editor dev team. This ticket should include an explanation of the feature, the changes that were made and instructions for QA what to test (regression and progression if needed)
* Try to divide your code changes into small independent chunks that can be reviewed quickly and merged
* All code should be fully tested (unit tests and integration tests)
* It is your responsibility to contact Editor QA team and prioritize the testing of your changes and work.
* We expect that you review your code with your peers before submitting. We will review your code as well, but in order to avoid long ping-pongs we prefer not to get into syntax, quality and coverage.
* The pull request should be green in GitHub

## Quick start
### Permissions
* Join the 'wix' and 'wix-private' Github orgs by going to http://github.wixpress.com and filling in the requirements.
* Editor-Company developers should belong to the 'santa' team for write access. After joining the Github orgs, fill in [this form](https://goo.gl/forms/kWsiwjDwUnPHKFNY2).

### Setup
* If you're setting up a new computer, follow the instructions in the [New computer setup page](https://github.com/wix/santa/wiki/New-computer-setup) to make sure that all global dependencies are installed correctly.
* Be connected to the internet at all times.
* Have NodeJS and [Ruby >2.1.5](https://www.ruby-lang.org/en/downloads/) installed.
* Have your ssh keys [linked to your github account](https://github.com/settings/ssh).
* Run these lines:


```bash
gem install bundler -v '=1.10.6'
npm install -g grunt-cli # Never "sudo npm install"
git clone git@github.com:wix/santa.git
cd santa
npm install
bundle install
grunt
sudo npm start # on windows - sudo not required
```
This should run the server on port 80, saying something like `Listening on ip 0.0.0.0, port 80`. Otherwise, you probably have something else running on port 80, or that skype is on.

Then add this query param to any Wix site:
```
?ReactSource=http://localhost&debug=all
```
([example](http://danywix.wix.com/cthulhu?ReactSource=http://localhost&debug=all))

### Also
* Make sure that you are added to the santa@wix.com mailing list.
* Make sure the email in your gitconfig is also listed in [this Github settings page](https://github.com/settings/emails).

## Troubleshooting

### Can't clone, pull, or push
* Make sure that you are a memeber of [github.com/wix](https://github.com/wix). If not, make sure you have 2-factor authentication in Github, and go to http://github.wixpress.com
* Make sure you are a member of the [santa-collaborators](https://github.com/orgs/wix/teams/santa-collaborators) team. If not, talk to Eitan Russo or to member of the client-infra team.

### Sass errors
Make sure that `sass --version` returns "Sass 3.4.13 (Maptastic Maple)". If it doesn't, it means that you have an additional version of sass installed, (besides the one installed by `bundle install` in the project). Uninstall it, and make sure that in a new terminal, `sass --version` returns the right version.

### Local failure
If you get `Syntax error: Invalid US-ASCII character`, it means there are non standard charcters in one of the scss files.
Locate the file, and add `@charset "UTF-8";` as the first line in the file.

For any other issue, run the magick line:
```bash
git pull && npm i && grunt all
```

### Something else does not work!!
Restart the project with:
```bash
git pull
grunt all
sudo npm start # on windows - sudo not required
```
If that doesn't work:
```bash
git checkout master
git reset --hard origin/master
git pull
rm -rf ~/.npm # in windows delete the C:\Users\USER\AppData\Roaming\npm-cache folder
rm -rf node_modules
npm cache clear
npm i
bower install
grunt all
sudo npm start # on windows - sudo not required
```

Also, read the [wiki's troubleshooting section](//github.com/wix/santa/wiki/Setting-up-Development-Environment#troubleshooting), [search your mail](https://mail.google.com/mail/u/0/#search/santa+doesn't+work+-lifecycle) and
[Google](http://bit.ly/1z1f7Jy) for the error you receive,
reclone the project and follow the [quick start section](#quick-start) above, or
[turn it off and on again](https://www.youtube.com/watch?v=nn2FB1P_Mn8).

### Broken build

See the [Santa build status guide](https://github.com/wix/santa/wiki/Santa-Build-Status-Guide).

## Writing tests

Please read the [Jasmine tips page](https://github.com/wix/santa/wiki/Jasmine-unit-testing-tips) before starting to write tests!

## Running tests
```bash
#In the project's root or a package's root:
karma start
#or, only in the project's root:
karma start -p utils,skins
```

## Importing an existing Wix site

[Importing an existing Wix site](https://github.com/wix/santa/wiki/Setting-up-Development-Environment#importing-sites)

## Documentations
JSDocs are generated hourly to http://santa.wixpress.com:5555/

To generate them locally, make sure you have jsduck installed with `gem install jsduck`, and generate them into `/jsdocs` with `grunt jsduck`.

## Contributing

### How to suggest or request code changes to the Santa code base

If you are required to make changes to the editor, please:
* Align your plans with one of the Editor team leaders or managers and make sure to be a member of the Github Wix org (via [github.wixpress.com](http://github.wixpress.com)).
* [Fork Santa or Santa-Editor](https://help.github.com/articles/fork-a-repo/).
* Read the Santa and Santa-Editor README files. You should be able to run `grunt all` successfully.
* Make your changes.
* Make sure `grunt all` still runs successfully.
* Commit and push your changes and [create a pull request](https://help.github.com/articles/creating-a-pull-request/). Once a pull request is created, [a build+deployment process will start](https://github.com/wix/santa/wiki/Creating-a-mock-RC-from-branch).
* Assign your pull request to the team leader or manager you are aligned with.
* Adding this list of mentions to your pull request will help us to take care of the pull request faster: `@danyshaanan @idok @rousso1 @shaikfir`
