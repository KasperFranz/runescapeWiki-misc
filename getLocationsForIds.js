const fs = require('node:fs');


// Example usage
const ids = [120404];
const sceneryName = 'Chest of drawers'


const locations = [
    {name: '[[Senntisten]]', minX: 1537, maxX: 2100, minY: 1150, maxY: 1360, mapId: '-1'},
    {name: '[[The Zamorakian Undercity]]', minX: 1600, maxX: 1790, minY: 1500, maxY: 1790, mapId: 740},
    {name: '[[Senntisten Asylum]]', minX: 1930, maxX: 2038, minY: 1420, maxY: 1530, mapId: 738},
    {name: '[[Daemonheim]]', minX: 3374, maxX: 3525, minY: 3607, maxY: 3796, mapId: '-1'}
];

const template = `{{ObjectLocLine
|name={{NAME}}
|loc = {{LOCATION}}{{FLOOR}}
|mem=Yes
{{LOCATIONS}}
|mapID={{MAPID}}{{PLANE}}
}}`;

getIDsAndCoords(ids)
    .then(output => {

        fs.writeFile('output/locations/' + sceneryName.replaceAll(' ','_') + ids.join('_') + '.md', output, err => {
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

async function getIDsAndCoords(ids) {
    let results = [];
    let data = [];
    for (let id of ids) {
        try {
            const url = `https://mejrs.github.io/data_rs3/locations/${id}.json`
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch data for ID ${id}: ${response.statusText}`);
            }
            let localData = await response.json();
            localData = localData.filter(checkUnwantedLocations);
            data = data.concat(localData);


        } catch (error) {
            console.error(error);
        }
    }

    let tempData = {};
    for (let item of data) {
        let found = 0;
        let dataY = (item.j * 64 + item.y);
        let dataX = (item.i * 64 + item.x)
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
            console.log(item);
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
    let dataX = (item.i * 64 + item.x);

    return true
    // console.log(object)
}