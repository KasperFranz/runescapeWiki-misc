const axios = require('axios');
const fs = require('node:fs');


const localIds = getLocalIds();
const ignoredNames = [
    'Gate', 'Door', 'Stairs'
]
/*
axios.get('https://chisel.weirdgloop.org/gazproj/mrod/get/1-100')
  .then(function (response) {
    // handle success

    console.log(`Checking`)
    console.log(response.data.length)
    response.data.forEach(element => {
        if(element.name == ''){
            return;
        }

        if(ignoredNames.indexOf(element.name) >= 0){
            return;
        }

        if(localIds.indexOf(element.id) >= 0){
            return;
        }
        console.log(localIds.indexOf(element.id))
        console.log(element)
    })
  })

*/
  function getLocalIds() {
    
    let data = JSON.parse(fs.readFileSync('runescape_wiki_input.json', 'utf8'));

    let output = [];

    for(var attributename in data["results"]){
        element = data["results"][attributename]
        element["printouts"]["All Object ID"].forEach(elementId => {
            output.push(elementId)
        })
      }
      return output
  }


  function getIdsFromFile(fileName){
    let data = JSON.parse(fs.readFileSync(fileName, 'utf8'));

    ids

  }