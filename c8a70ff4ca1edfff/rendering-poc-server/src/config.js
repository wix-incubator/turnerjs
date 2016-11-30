import metasiteRpcClient from './rpc/metasite';
import publicHtmlRpcClient from './rpc/publicHtml';
import publicModelsRendererRpcClient from './rpc/publicModels';



module.exports = context => {
  const config = context.config.load('rendering-poc-server');
  const metasiteRpcClientFactory = context.rpc.clientFactory(config.services.metasite, 'ReadOnlyMetaSiteManager');
  const publicHtmlRpcClientFactory = context.rpc.clientFactory(config.services.publicHtml, 'PublishService');
  const publicModelsRendererRpcClientFactory = context.rpc.clientFactory(config.services.htmlRenderer, 'PublicModelsRenderer');

  return {
    rpc: {
      metasite: aspects => metasiteRpcClient(metasiteRpcClientFactory)(aspects),
      publicModels: aspects => publicModelsRendererRpcClient(publicModelsRendererRpcClientFactory)(aspects),
      publicHtml: aspects => publicHtmlRpcClient(publicHtmlRpcClientFactory)(aspects)
    },
    hostname: `http://${context.env.HOSTNAME}:${context.env.PORT}`,
    basename: context.env.MOUNT_POINT,
    config
  };
};
