const fs = require('node:fs');


// Example usage
const ids = [	125233];
const sceneryName = 'Operating table'


const locations = [
    {name: '[[Senntisten]]', minX: 1537, maxX: 2100, minY: 1150, maxY: 1360, mapId: '-1'},
    {name: '[[The Zamorakian Undercity]]', minX: 1600, maxX: 1790, minY: 1500, maxY: 1790, mapId: 740},
    {name: '[[Senntisten Asylum]]', minX: 1930, maxX: 2038, minY: 1420, maxY: 1530, mapId: 738},
    {name: '[[Daemonheim]]', minX: 3374, maxX: 3525, minY: 3607, maxY: 3796, mapId: '-1'},
    {name: '[[Freneskae]]', minX: 2560, maxX: 2816, minY: 12287, maxY: 12607, mapId: '-1'},
    {name: '[[Freneskae#The_Ritual_Site|Freneskae Ritual Site]]', minX: 2428, maxX: 2561, minY: 12350, maxY: 12547, mapId: '-1'},
    {name: '[[Mort Myre Swamp]]', minX: 3398, maxX: 3646, minY: 3252, maxY: 3528, mapId: '-1'},
    {name: '[[The beach]]', minX: 3140, maxX: 3193, minY: 3203, maxY: 3260, mapId: '-1'},
    {name: '[[Al Kharid]]', minX: 3266, maxX: 3334, minY: 3133, maxY: 3221, mapId: '-1'},

];

const ignoredLocations =
    [
        {name: 'Senntisten instance 1', minX: 1595, maxX: 2049, minY: 1791, maxY: 2054, mapId: '-1'},
        {name: 'Senntisten instance 2', minX: 514, maxX: 900, minY: 129, maxY: 529, mapId: '-1'},
        {name: 'Mort Myre Swamp instance', minX: 1984, maxX: 2050, minY: 4990, maxY: 5056, mapId: '-1'},
        {name: 'Mort Myre Swamp instance', minX: 3778, maxX: 3969, minY: 7550, maxY: 7746, mapId: '-1'},
    ];
const template = `{{ObjectLocLine
|name = {{NAME}}
|loc = {{LOCATION}}{{FLOOR}}
|mem = Yes
{{LOCATIONS}}
|mapID = {{MAPID}}{{PLANE}}
}}`;

getIDsAndCoords(ids)
    .then(output => {
        if (output.length === 0) {
            return
        }
        fs.writeFile('output/locations/' + sceneryName.replaceAll(' ', '_') + ids.join('_') + '.md', output, err => {
            if (err) {
                console.error(err);
            }
        });
    })
    .catch(error => {
        console.error('Error:', error);
    });

function formatData(data) {

    let resultsTable = [];
    for (let i = 0; i < data.length; i++) {
        let tempValue = `|x:${(data[i].i * 64 + data[i].x)},y:${(data[i].j * 64 + data[i].y)}`;
        //{{Object map|mapID=-1|1494,5227|1502,5222|group}
        resultsTable.push(tempValue);
    }
    return resultsTable;
}

async function getRemoteData(id) {
    const url = `https://mejrs.github.io/data_rs3/locations/${id}.json`
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
        },
    });

    if (!response.ok) {
        if (response.status === 429) {
            throw new Error(`Failed to fetch data for ID ${id}: Rate limit exceeded`);
        }
        throw new Error(`Failed to fetch data for ID ${id}: ${response.statusText}`);
    }
    return await response.json();
}

async function getLocalData(id) {
    const path = `../DATA_RS3/locations/${id}.json`
    return JSON.parse(fs.readFileSync(path, 'utf8'));
}

async function getData(id) {
    let localData = null;
    try {
        localData = await getLocalData(id);
    }catch(e) {
        localData = await getRemoteData(id)
    }
    return localData.filter(checkUnwantedLocations);
}

function notFoundParse(item) {
    return {
        x: (item.i * 64 + item.x),
        y: (item.j * 64 + item.y),
        plane: item.plane,
        id: item.id
    };
}

async function getIDsAndCoords(ids) {
    let results = [];
    let data = [];
    for (let id of ids) {

        try {
            data = data.concat(await getData(id));

        } catch (error) {
            console.error(error);
        }
    }

    data.sort(compareItems)
    let tempData = {};
    for (let item of data) {
        let found = 0;
        let dataY = (item.j * 64 + item.y);
        let dataX = (item.i * 64 + item.x);
        for (let location of locations) {
            if (dataX > location.minX && dataX < location.maxX && dataY > location.minY && dataY < location.maxY) {
                const named = location.name + ':::::' + location.mapId
                if (!Object.hasOwn(tempData, named)) {
                    tempData[named] = {};
                }
                if (!Object.hasOwn(tempData[named], item.plane)) {
                    tempData[named][item.plane] = [];
                }
                tempData[named][item.plane].push(item);
                //if found lets just do a +1
                found++;
            }
        }

        if (found === 0) {
            //TODO: remove once clarification
            console.log('not found');
            console.log(notFoundParse(item));
        }

    }


    if (Object.entries(tempData).length > 0) {
        results.push('{{ObjectTableHead}}')
    }

    for (const [key, data] of Object.entries(tempData)) {
        const multiplePlanes = Object.entries(data).length > 1;
        let [locationName, mapId] = key.split(':::::');

        for (const [plane, locationData] of Object.entries(data)) {

            const floorString = multiplePlanes ? " ({{FloorNumber|" + ((+plane) + 1) + "}})" : ''
            const planeString = plane > 0 ? "\n|plane=" + plane : ''
            results.push(
                template.replace('{{LOCATIONS}}', formatData(locationData).toString().replaceAll(",|", "|"))
                    .replace('{{LOCATION}}', locationName)
                    .replace('{{MAPID}}', mapId)
                    .replace('{{FLOOR}}', floorString)
                    .replace('{{NAME}}', sceneryName)
                    .replace('{{PLANE}}', planeString)
            )
        }
    }
    if (results.length > 0) {
        results.push('{{ObjectTableBottom}}');
    }

    return results.join("\n")
}

function checkUnwantedLocations(item) {
    let dataY = (item.j * 64 + item.y);
    let dataX = (item.i * 64 + item.x)
    for (let ignoreLocation of ignoredLocations) {
        if (dataX > ignoreLocation.minX && dataX < ignoreLocation.maxX && dataY > ignoreLocation.minY && dataY < ignoreLocation.maxY) {
            return false;
        }
    }

    return true
    // console.log(object)
}

function compareItems(a,b){
    return a.plane-b.plane;
}