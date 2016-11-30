import fs from 'fs';
import path from 'path';


function siteModel() {
  const basePath = path.normalize(__dirname + '/../../..');



  // const file = basePath + '/data/blankPage.json';
  const file = basePath + '/data/sampleSite.json';
  // const file = basePath + '/data/cacao.json';
  // const file = basePath + '/data/kuppa.json';
  // const file = basePath + '/data/kathrynscraps.json';
  // const file = basePath + '/data/faerieorganic.json';
  // const file = basePath + '/data/mockData.json';
  // const file = basePath + '/data/siteModel.json';
  // const file = basePath + '/data/temp.json';
  if (fs.existsSync(file)) {
    const data = fs.readFileSync(file, 'utf8');
    return JSON.parse(data);
  }
  return "No File";
};


exports.siteModel = siteModel;