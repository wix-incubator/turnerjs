export default function publicHtmlRpcClient(publicHtmlRpcClientFactory) {
  return aspects => {
    const client = publicHtmlRpcClientFactory.client(aspects);
    return {
      getSiteById: id => client.invoke('getSiteById', id)
    };
  };
}
