export function incrementCounter() {
  return {
    type: 'INCREMENT'
  };
}

export function decrementCounter() {
  return {
    type: 'DECREMENT'
  };
}

export function fetchSites() {
  return (dispatch, getState, {fetch}) => {
    dispatch({
      type: 'FETCH_SITES_REQUEST'
    });

    return fetch('/sites')
      .then(response => response.json())
      .then(data => dispatch({
        type: 'FETCH_SITES_SUCCESS',
        data
      }))
      .catch(error => dispatch({
        type: 'FETCH_SITES_ERROR',
        error
      }));
  };
}
