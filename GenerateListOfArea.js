import { readFileSync, writeFile as _writeFile } from 'node:fs';
import JSON5 from 'json5'

const location = '41_49'

async function getFile(file) {
    const path = `output/${file}.json5`
    return JSON5.parse(readFileSync(path, 'utf8'));
}

async function loadFile(id) {
    const path = `output/itemLocations/${id}.json`
    return JSON.parse(readFileSync(path, 'utf8'));
}

async function getLocationConfigLocal(id) {
    const path = `${localDataLocation}/location_configs/${id}.json`
    return JSON.parse(readFileSync(path, 'utf8'));
}


const knownEmpty = await getFile('known_empty_scenery');
const knownScenery = await getFile('mapped_scenery');


const items = await loadFile(location);
let foundId = [];
let notFoundIds = [];

for(let item of items){
    if(
        knownEmpty.indexOf(item['id']) === -1 &&
        knownScenery.indexOf(item['id']) === -1
    ){
        const data =await callWikiAPI(item['id'])
        let onWiki = Object.keys(data['query']['results']).length
       // console.log(`https://runescape.wiki/w/Special:SearchByProperty?limit=20&property=Object+ID&value=${item['id']}`)
       if(onWiki){
        foundId.push(item['id'])
       }else{
        notFoundIds.push(item['id'])
       }
        
    }
}

if(foundId.length > 0){
    console.log('existing ids')
    console.log(JSON.stringify(foundId).replaceAll('[','').replaceAll(']',`, //${location}`))
}
if(notFoundIds.length > 0){
    console.log('Needs to be created:')
    console.log(JSON.stringify(notFoundIds).replaceAll('[','').replaceAll(']',`, //${location}`))
}

async function callWikiAPI(id){
    const url = 'https://runescape.wiki/api.php?action=ask&format=json&query='+ encodeURI(`[[Object ID::${id}]]`)
    let response = await fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            "User-Agent"   : "KasperFranz on discord"
        },
    });
    if(response.status !== 200){
        console.log(response.body)
    }
    return await response.json()
}