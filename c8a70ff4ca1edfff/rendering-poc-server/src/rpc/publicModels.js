export default function publicModelsRendererRpcClient(publicModelsRendererRpcClientFactory) {
  return aspects => {
    const client = publicModelsRendererRpcClientFactory.client(aspects);
    return {
      renderModels: id => client.invoke('renderModels', id)
    };
  };
}
