/*eslint camelcase: ["error", {properties: "never"}]*/

const BASE_FOLDERS_REQUEST = 'http://files.wix.com/folders';

export async function getFolders() {
  const response = await fetch(BASE_FOLDERS_REQUEST);
  return await response.json();
}

export async function createFolder(name) {
  const response = await fetch(BASE_FOLDERS_REQUEST, {
    method: 'POST',
    body: JSON.stringify({
      folder_name: name,
      media_type: 'picture'
    })
  });
  return await response.json();
}
