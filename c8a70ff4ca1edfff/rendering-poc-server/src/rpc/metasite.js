export default function metasiteRpcClient(metasiteRpcClientFactory) {
  return aspects => {
    const client = metasiteRpcClientFactory.client(aspects);
    return {
      listMetasites: userId => client.invoke('listSites', userId),
      getMetaSite: msId => client.invoke('getMetaSite', msId)
    };
  };
}
