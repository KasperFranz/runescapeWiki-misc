const fs = require('node:fs');

const localDataLocation = '../rs3cache/output'

// Example usage
    const ids = [130744];
const useTemplate2 = false;


let sceneryName = 'NOT_FOUND'


const locations = [
    {name: '[[Senntisten]]', west: 1535, east: 2112, north: 1417, south: 1088, mapId: '-1'},
    {name: '[[The Zamorakian Undercity]]', west: 1600, east: 1790, north: 1790, south: 1500, mapId: 740},
    {name: '[[Senntisten Asylum]]', west: 1930, east: 2038, north: 1530, south: 1420, mapId: 738},
    {name: '[[Daemonheim]]', west: 3374, east: 3525, north: 3796, south: 3607, mapId: '-1'},
    {name: '[[Freneskae]]', west: 2560, east: 2816, north: 12607, south: 12287, mapId: '-1'},
    {name: '[[Freneskae#The_Ritual_Site|Freneskae Ritual Site]]', west: 2428, east: 2561, north: 12547, south: 12350, mapId: '-1'},
    {name: '[[Mort Myre Swamp]]', west: 3398, east: 3646, north: 3528, south: 3252, mapId: '-1'},
    {name: '[[The beach]]', west: 3140, east: 3193, north: 3260, south: 3203, mapId: '-1'},
    {name: '[[Al Kharid]]', west: 3266, east: 3334, north: 3221, south: 3133, mapId: '-1'},
    {name: '[[Fort Forinthry]]', west: 3273, east: 3337, north: 3578, south: 3530, mapId: '-1'},
    {name: '[[Wizards\' Tower]]', west: 3065, east: 3136, north: 3196, south: 3123, mapId: '-1'},
    {name: '[[Armadyl\'s Tower]]', west: 2980, east: 3000, north: 3276, south: 3254, mapId: '-1'},
    {name: '[[Void Knights\' Outpost]]', west: 2595, east: 2711, north: 2689, south: 2532, mapId: '-1'},
    {name: '[[Slayer Tower]]', west: 3396, east: 3451, north: 3579, south: 3537, mapId: '-1'},
    {name: '[[Gulvas Mansion]]', west: 2937, east: 3010, north: 6275, south: 6211, mapId: '-1'},
    {name: '[[Robert the Strong\'s library]]', west: 2199, east: 2223, north: 5934, south: 5910, mapId: '-1'},
    {name: '[[Camdozaal]]', west: 3021, east: 3056, north: 9910, south: 9868, mapId: '-1'},
    {name: '[[Het\'s Oasis]]', west: 3324, east: 3409, north: 3266, south: 3203, mapId: '-1'},
    {name: '[[Lighthouse]]', west: 2484, east: 2528, north: 3660, south: 3617, mapId: '-1'},
    {name: '[[Moksha ritual site]]', west: 1088, east: 1152, north: 256, south: 192, mapId: '-1'},
    {name: '[[Daemonheim - Depths excavation site]]', west: 2176, east: 2240, north: 9280, south: 9216, mapId: '-1'},
    {name: '[[Kerapac\'s laboratory]]', west: 5288, east: 5434, north: 2907, south: 2739, mapId: '-1'},
    {name: '[[Warforge Dig Site]]', west: 2240, east: 2368, north: 7424, south: 7296, mapId: '729'},
    {name: '[[Warforge Dig Site]]', west: 2368, east: 2432, north: 7360, south: 7296, mapId: '730'},
    {name: '[[City of Um]]', west: 896, east: 1279, north: 1985, south: 1600, mapId: '742'},
    {name: '[[Rex Matriarch lair]]', west: 3968, east: 4096, north: 9856, south: 9728, mapId: '749'},
    {name: '[[Rex Matriarch lair]]', west: 3840, east: 3968, north: 9920, south: 9793, mapId: '750'},
    {name: '[[Anachronia]]', west: 5248, east: 5760, north: 2626, south: 2047, mapId: '-1'},
    {name: '[[]]', west: 0, east: 0, north: 0, south: 0, mapId: '-1'},
    {name: '[[]]', west: 0, east: 0, north: 0, south: 0, mapId: '-1'},
    {name: '[[]]', west: 0, east: 0, north: 0, south: 0, mapId: '-1'},

];

const ignoredLocations = [
    {name: 'Senntisten instance (Twilight of the gods)', west: 1595, east: 2049, north: 2054, south: 1791, mapId: '-1'},
    {name: 'Senntisten instance (City of Senntisten)', west: 514, east: 900, north: 529, south: 129, mapId: '-1'},
    {name: 'Mort Myre Swamp instance', west: 1984, east: 2050, north: 5056, south: 4990, mapId: '-1'},
    {name: 'Mort Myre Swamp instance', west: 3778, east: 3969, north: 7746, south: 7550, mapId: '-1'},
    {name: 'Fort Forinthry instance', west: 1280, east: 1344, north: 1536, south: 1472, mapId: '-1'},
    {name: 'Fort Forinthry instance 2', west: 1152, east: 1408, north: 2240, south: 2111, mapId: '-1'},
    {name: 'Wizards tower instance', west: 1153, east: 1216, north: 4864, south: 4800, mapId: '-1'},
    {name: 'South Falador instance', west: 2612, east: 2861, north: 6470, south: 6323, mapId: '-1'},
    {name: 'South Falador instance', west: 3496, east: 3585, north: 7107, south: 7039, mapId: '-1'},
    {name: 'South Falador instance', west: 3496, east: 3585, north: 7107, south: 7039, mapId: '-1'},
    {name: 'lighthouse copy', west: 2415, east: 2496, north: 4634, south: 4544, mapId: '-1'},
];
const template = `{{ObjectLocLine
|name = {{NAME}}
|loc = {{LOCATION}}{{FLOOR}}
|mem = Yes
{{LOCATIONS}}
|mapID = {{MAPID}}{{PLANE}}
}}`;

const template2 = `|map = {{Object map|mapID={{MAPID}}{{PLANE}}|objectId={{OBJECTID}}{{LOCATIONS}}}}`

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
    const path = `${localDataLocation}/locations/${id}.json`
    return JSON.parse(fs.readFileSync(path, 'utf8'));
}

async function getLocationConfigLocal(id) {
    const path = `${localDataLocation}/location_configs/${id}.json`
    return JSON.parse(fs.readFileSync(path, 'utf8'));
}

async function getData(id) {
    let localData;
    try {
        localData = await getLocalData(id);
    } catch (e) {
        localData = await getRemoteData(id)
    }

    const nameData1 = await getLocationConfigLocal(id)
    if (Object.hasOwn(nameData1, 'name')) {
        sceneryName = nameData1['name']
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
            if (dataX >= location.west && dataX <= location.east && dataY >= location.south && dataY <= location.north) {
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


    if (!useTemplate2 && Object.entries(tempData).length > 0) {
        results.push('{{ObjectTableHead}}')
    }

    for (const [key, data] of Object.entries(tempData)) {
        let [locationName, mapId] = key.split(':::::');

        for (const [plane, locationData] of Object.entries(data)) {

            const floorString = plane > 0 ? " ({{FloorNumber|" + ((+plane) + 1) + "}})" : ''
            const planeString = plane > 0 ? "\n|plane=" + plane : ''
            if (!useTemplate2) {
                results.push(
                    template.replaceAll('{{LOCATIONS}}', formatData(locationData).toString().replaceAll(",|", "|"))
                        .replaceAll('{{LOCATION}}', locationName)
                        .replaceAll('{{MAPID}}', mapId)
                        .replaceAll('{{FLOOR}}', floorString)
                        .replaceAll('{{NAME}}', sceneryName)
                        .replaceAll('{{PLANE}}', planeString)
                )
                continue;
            }
            results.push(
                template2.replaceAll('{{LOCATIONS}}', formatData(locationData).toString().replaceAll(",|", "|"))
                    .replaceAll('{{LOCATION}}', locationName)
                    .replaceAll('{{MAPID}}', mapId)
                    .replaceAll('{{OBJECTID}}', locationData[0].id)
                    .replaceAll('{{FLOOR}}', floorString)
                    .replaceAll('{{NAME}}', sceneryName)
                    .replaceAll('{{PLANE}}', planeString)
            )
        }
    }
    if (!useTemplate2 && results.length > 0) {
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