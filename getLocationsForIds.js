const fs = require('node:fs');


// Example usage
const ids = [	125233];
const sceneryName = 'Operating table'


const locations = [
    {name: '[[Senntisten]]', west: 1537, east: 2100, north: 1360, south: 1150, mapId: '-1'},
    {name: '[[The Zamorakian Undercity]]', west: 1600, east: 1790, north: 1790, south: 1500, mapId: 740},
    {name: '[[Senntisten Asylum]]', west: 1930, east: 2038, north: 1530, south: 1420, mapId: 738},
    {name: '[[Daemonheim]]', west: 3374, east: 3525, north: 3796, south: 3607, mapId: '-1'},
    {name: '[[Freneskae]]', west: 2560, east: 2816, north: 12607, south: 12287, mapId: '-1'},
    {name: '[[Freneskae#The_Ritual_Site|Freneskae Ritual Site]]', west: 2428, east: 2561, north: 12547, south: 12350, mapId: '-1'},
    {name: '[[Mort Myre Swamp]]', west: 3398, east: 3646, north: 3528, south: 3252, mapId: '-1'},
    {name: '[[The beach]]', west: 3140, east: 3193, north: 3260, south: 3203, mapId: '-1'},
    {name: '[[Al Kharid]]', west: 3266, east: 3334, north: 3221, south: 3133, mapId: '-1'},
    {name: '[[Fort Forinthry]]', west: 3273, east: 3337, north: 3578, south: 3530, mapId: '-1'},

];

const ignoredLocations =
    [
        {name: 'Senntisten instance 1', west: 1595, east: 2049, north: 2054, south: 1791, mapId: '-1'},
        {name: 'Senntisten instance 2', west: 514, east: 900, north: 529, south: 129, mapId: '-1'},
        {name: 'Mort Myre Swamp instance', west: 1984, east: 2050, north: 5056, south: 4990, mapId: '-1'},
        {name: 'Mort Myre Swamp instance', west: 3778, east: 3969, north: 7746, south: 7550, mapId: '-1'},
        {name: 'Fort Forinthry instance', west: 1280, east: 1344, north: 1536, south: 1472, mapId: '-1'},
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
    } catch (e) {
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
            if (dataX > location.west && dataX < location.east && dataY > location.south && dataY < location.north) {
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
        if (dataX > ignoreLocation.west && dataX < ignoreLocation.east && dataY > ignoreLocation.south && dataY < ignoreLocation.north) {
            return false;
        }
    }

    return true
    // console.log(object)
}

function compareItems(a, b) {
    return a.plane - b.plane;
}