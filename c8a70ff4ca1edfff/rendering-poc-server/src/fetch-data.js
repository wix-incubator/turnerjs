function fetchData(dispatch, components, params) {
  const promises = components
    .filter(component => component.fetchData)
    .map(component => component.fetchData(dispatch, params));

  return Promise.all(promises);
}

export default fetchData;
