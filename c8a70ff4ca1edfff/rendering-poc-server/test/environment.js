import testkit from 'wix-bootstrap-testkit';
import rpcTestkit from 'wix-rpc-testkit';
import configEmitter from 'wix-config-emitter';

let started = false;

export const app = bootstrapServer();
export let rpcServer;

export const addRpcHandler = function (service, method, responseOrHandler) {
  rpcServer.addHandler(service, (req, res) => {
    res.rpc(method, (params, respond) => {
      if (typeof responseOrHandler === 'function') {
        responseOrHandler(params, respond);
      } else {
        respond({result: responseOrHandler});
      }
    });
  });
};

export const start = function () {
  beforeEach(() => {
    if (started === false) {
      rpcServer = anRpcServer(); //TODO - maybe there's a better way to reset previous handlers
      return emitConfigs(rpcServer)
        .then(() => rpcServer.start())
        .then(() => app.start())
        .then(() => started = true);
    }
  });

  afterEach(() => {
    if (started === true) {
      return app.stop()
        .then(() => rpcServer.stop())
        .then(() => started = false);
    }
  });
};

function emitConfigs(rpcServer) {
  return configEmitter({sourceFolders: ['./templates'], targetFolder: './target/configs'})
    .fn('service_url', 'com.wixpress.wix-meta-site-manager-webapp', rpcServer.getUrl())
    .fn('service_url', 'com.wixpress.wix-public-html-api-webapp', rpcServer.getUrl())
    .fn('service_url', 'com.wixpress.wix-public-html-renderer-webapp', rpcServer.getUrl())
    .fn('static_url', 'com.wixpress.sandbox.rendering-poc-server', {schemaless: true}, 'http://localhost:3200/')
    .emit();
}

function anRpcServer() {
  return rpcTestkit.server();
}

function bootstrapServer() {
  return testkit.app('./index', {
    env: {
      PORT: 3100,
      MANAGEMENT_PORT: 3104,
      NEW_RELIC_LOG_LEVEL: 'warn',
      DEBUG: ''
    }
  });
}
