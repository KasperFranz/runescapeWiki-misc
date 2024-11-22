import { readFileSync, writeFile as _writeFile } from 'node:fs';

const localDataLocation = '../rs3cache/output'


async function getLocationConfigLocal(id) {
    const path = `${localDataLocation}/location_configs/${id}.json`
    return JSON.parse(readFileSync(path, 'utf8'));
}


async function writeFile(location,data){
    _writeFile(location, data, err => {
        if (err) {
            console.error(err);
        }
    });
}

let known_empty = [];


for (let id = 1; id < 131619; id++) {
    try {
        const data = await getLocationConfigLocal(id)
        if(data['name'] === undefined){
            known_empty.push( data['id'])
        }
    } catch (error) {
        console.error(error);
    }
}

writeFile('output/known_empty_scenery.json',JSON.stringify(known_empty))

