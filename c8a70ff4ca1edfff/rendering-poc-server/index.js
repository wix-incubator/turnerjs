const bootstrap = require('wix-bootstrap-ng');

const rootDir = './dist/src';
const getPath = path => process.env.NODE_ENV === 'test' ?
  `./src/${path}` :
  `${rootDir}/${path}`;

require('css-modules-require-hook')({
  rootDir,
  generateScopedName: '[path][name]__[local]__[hash:base64:5]',
  extensions: ['.scss', '.css'],
  camelCase: true
});

bootstrap()
  .use(require('wix-bootstrap-rpc'))
  .config(getPath('config'))
  .express(getPath('server'))
  .start({disableCluster: process.env.NODE_ENV === 'development'});
