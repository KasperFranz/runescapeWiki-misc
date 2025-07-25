const fs = require('node:fs');
const { type } = require('node:os');

const localDataLocation = '../rs3cache/output'

const ids = process.argv.slice(2).map((value) =>  value.split(','));
const useTemplate2 = false;
const defaultmember = true;
const goOnline = false;

let sceneryName = 'NOT_FOUND'

let morph_mapping;

const locations = [
    {name: '[[Senntisten]]', west: 1535, east: 2112, north: 1417, south: 1088, mapId: '-1'},
    {name: '[[The Zamorakian Undercity]]', west: 1600, east: 1790, north: 1790, south: 1500, mapId: 740},
    {name: '[[Senntisten Asylum]]', west: 1930, east: 2038, north: 1530, south: 1420, mapId: 738},
    {name: '[[Daemonheim]]', west: 3374, east: 3525, north: 3796, south: 3607, mapId: '28'},
    {name: '[[Freneskae]]', west: 2560, east: 2816, north: 12607, south: 12287, mapId: '-1'},
    {name: '[[Freneskae#The_Ritual_Site|Freneskae Ritual Site]]', west: 2428, east: 2561, north: 12547, south: 12350, mapId: '-1'},
    {name: '[[Mort Myre Swamp]]', west: 3398, east: 3710, north: 3528, south: 3252, mapId: '28'},
    {name: '[[The beach]]', west: 3140, east: 3193, north: 3260, south: 3203, mapId: '28'},
    {name: '[[Het\'s Oasis]]', west: 3312, east: 3409, north: 3280, south: 3203, mapId: '28'},
    {name: '[[Al Kharid]]', west: 3266, east: 3334, north: 3269, south: 3133, mapId: '28'},
    {name: '[[Fort Forinthry]]', west: 3273, east: 3337, north: 3578, south: 3530, mapId: '28'},
    {name: '[[Wizards\' Tower]]', west: 3065, east: 3136, north: 3196, south: 3123, mapId: '28'},
    {name: '[[Armadyl\'s Tower]]', west: 2980, east: 3000, north: 3276, south: 3254, mapId: '28'},
    {name: '[[Void Knights\' Outpost]]', west: 2595, east: 2711, north: 2689, south: 2532, mapId: '28'},
    {name: '[[Slayer Tower]]', west: 3396, east: 3451, north: 3579, south: 3537, mapId: '-1'},
    {name: '[[Gulvas Mansion]]', west: 2937, east: 3010, north: 6275, south: 6211, mapId: '-1'},
    {name: '[[Robert the Strong\'s library]]', west: 2199, east: 2223, north: 5934, south: 5910, mapId: '-1'},
    {name: '[[Camdozaal]]', west: 3021, east: 3056, north: 9910, south: 9868, mapId: '-1'},
    {name: '[[Lighthouse]]', west: 2484, east: 2528, north: 3660, south: 3617, mapId: '28'},
    {name: '[[Moksha ritual site]]', west: 1088, east: 1152, north: 256, south: 192, mapId: '-1'},
    {name: '[[Daemonheim - Depths excavation site]]', west: 2176, east: 2240, north: 9280, south: 9216, mapId: '-1'},
    {name: '[[Orthen - Observation outpost excavation site]]', west: 1216, east: 1280, north: 128, south: 64, mapId: '-1'},
    {name: '[[Kerapac\'s laboratory]]', west: 5288, east: 5434, north: 2907, south: 2739, mapId: '-1'},
    {name: '[[Warforge Dig Site]]', west: 2240, east: 2368, north: 7424, south: 7296, mapId: '729'},
    {name: '[[Warforge Dig Site]]', west: 2368, east: 2432, north: 7360, south: 7296, mapId: '730'},
    {name: '[[City of Um]]', west: 896, east: 1279, north: 1985, south: 1600, mapId: '742'},
    {name: '[[Rex Matriarch lair]]', west: 3968, east: 4096, north: 9856, south: 9728, mapId: '749'},
    {name: '[[Rex Matriarch lair]]', west: 3840, east: 3968, north: 9920, south: 9793, mapId: '750'},
    {name: '[[Anachronia]]', west: 5248, east: 5760, north: 2626, south: 2047, mapId: '28'},
    {name: '[[Sophanem]]', west: 3266, east: 3323, north: 2807, south: 2631, mapId: '28'},
    {name: '[[Menaphos Imperial district]]', west: 3048, east: 3179, north: 2770, south: 2674, mapId: '28'},
    {name: '[[Menaphos Merchant district]]', west: 3176, east: 3254, north: 2816, south: 2747, mapId: '28'},
    {name: '[[Menaphos Worker district]]', west: 3131, east: 3176, north: 2825, south: 2770, mapId: '28'},
    {name: '[[Menaphos Port district]]', west: 3117, east: 3245, north: 2681, south: 2611, mapId: '28'},
    {name: '[[Rock Island Prison]]', west: 3015, east: 3062, north: 2997, south: 2958, mapId: '28'},
    {name: '[[Menaphos]]', west: 3076, east: 3263, north: 2819, south: 2606, mapId: '28'},
    {name: '[[Scabarite Cavern]]', west: 3264, east: 3327, north: 7615, south: 7552, mapId: '753'},
    {name: '[[Kharidian Desert]]', west: 3023, east: 3527, north: 3125, south: 2541, mapId: '28'},
    {name: '[[Prison (Fort Forinthry)]]', west: 1920, east: 1984, north: 1727, south: 1664, mapId: '751'},
    {name: '[[Dream World]]', west: 1728, east: 1792, north: 5120, south: 5056, mapId: '-1'},
    {name: '[[Dream World]] (fighting with [[me]])', west: 1792, east: 1856, north: 5120, south: 5056, mapId: '-1'},
    {name: '[[Troll Stronghold (area)|Troll Stronghold]]', west: 2816, east: 2880, north: 10112, south: 10048, mapId: '-1'},
    {name: '[[Guthixian ruins]]', west: 1780, east: 1918, north: 6076, south: 6021, mapId: '-1', member: true},
    {name: '[[Blooming Burrow]]', west: 3712, east: 3904, north: 5056, south: 4864, mapId: '747', member: false},
    {name: '[[Harvest Hollow]]', west: 460, east: 831, north: 1850, south: 1600, mapId: '752', member: false},
    {name: '[[Burthorpe]]', west: 2868, east: 2945, north: 3574, south: 3495, mapId: '28', member: false},
    {name: '[[Iron Enclave]]', west: 2240, east: 2367, north: 2751, south: 2624, mapId: '-1',member: false},
    {name: '[[Lumbridge]]', west: 3191, east: 3264, north: 3280, south: 3200, mapId: '-1'},
    {name: '[[Ancient Cavern]]', west: 1713, east: 1798, north: 5374, south: 5277, mapId: '36'},
    {name: '[[Orthen Oubliette]]', west: 5696, east: 5824, north: 2880, south: 2816, mapId: '734'},
    {name: '[[Lunar Isle]]', west: 2039, east: 2183, north: 3965, south: 3841, mapId: '-1'},
    {name: '[[God Wars Dungeon]]', west: 2816, east: 2944, north: 5376, south: 5238, mapId: '15'},
    {name: '[[Ancient Prison]]', west: 2816, east: 2944, north: 5239, south: 5184, mapId: '15'},
    {name: '[[Dorgesh-Kaan]]', west: 2688, east: 2752, north: 5376, south: 5248, mapId: '26'},
    {name: '[[Red Axe base|Hreidmar\'s palace]]', west: 1792, east: 1856, north: 6272, south: 6208, mapId: '-1'},
    {name: '[[Keldagrim]]', west: 2816, east: 2943, north: 10304, south: 10112, mapId: '21'},
    {name: '[[Keldagrim rat pits]]', west: 1920, east: 1983, north: 4735, south: 4672, mapId: '191'},
    {name: 'Consortium meeting room', west: 1984, east: 2047, north: 4543, south: 4480, mapId: '248'},
    {name: '[[The Lost Grove]] during [[Twilight of the Gods]]', west: 1216, east: 1280, north: 5696, south: 5632, mapId: '-1'},
    {name: '[[Christmas Village]]', west: 5120, east: 5311, north: 9855, south: 9728, mapId: '746', member: false},
    {name: '[[Shattered Worlds]]', west: 2944, east: 3456, north: 6656, south: 6400, mapId: '-1'},
    {name: '[[Shattered Worlds]]', west: 832, east: 960, north: 704, south: 640, mapId: '-1'},
    {name: '[[Burthorpe]] (Troll Warzone cutscene, historical)', west: 1088, east: 1157, north: 5957, south: 5888, mapId: '-1'},
    {name: '[[Burthorpe]] (2016 Halloween event, historical)', west: 4352, east: 4672, north: 11648, south: 11456, mapId: '-1', member: false},
    {name: '[[Heist]]', west: 2560, east: 2880, north: 1344, south: 1216, mapId: '-1'},
    {name: '[[Temple of Isolation]]', west: 3392, east: 3519, north: 7615, south: 7552, mapId: '754'},
    {name: '[[Soul Rune Temple]]', west: 1920, east: 1984, north: 6720, south: 6656, mapId: '-1'},
    {name: '[[Iceberg]]', west: 2624, east: 2752, north: 4096, south: 3968, mapId: '28'},
    {name: '[[Enchanted Valley]]', west: 3008, east: 3071, north: 4543, south: 4480, mapId: '175'},
    {name: '[[Ape Atoll]]', west: 2688, east: 2816, north: 2816, south: 2688, mapId: '28'},
    {name: '[[Isafdar]]', west: 2144, east: 2318, north: 3266, south: 3115, mapId: '28'},
    {name: '[[Water altar]]', west: 3456, east: 3520, north: 4864, south: 4800, mapId: '159'},
    {name: '[[Nature altar]]', west: 2368, east: 2431, north: 4863, south: 4800, mapId: '151'},
    {name: 'east of [[Draynor Village]]', west: 3131, east: 3161, north: 3293, south: 3249, mapId: '28', member: false},
    {name: '[[Barbarian Outpost]]', west: 2496, east: 2560, north: 3584, south: 3520, mapId: '28'},
    {name: '[[Crondis\'s pyramid]]', west: 2176, east: 2240, north: 6784, south: 6720, mapId: '-1'},
    {name: '[[Life altar]]', west: 1024, east: 1088, north: 5569, south: 5504, mapId: '-1'},
    {name: 'House north of [[Yanille]]', west: 2564, east: 2576, north: 3128, south: 3117, mapId: '28'},
    {name: '[[Yanille]]', west: 2496, east: 2623, north: 3113, south: 3071, mapId: '28'},
    {name: '[[Brimhaven]]', west: 2754, east: 2816, north: 3208, south: 3151, mapId: '28'},
    {name: '[[Port Khazard]]', west: 2626, east: 2687, north: 3197, south: 3140, mapId: '28'},
    {name: '[[Ardougne Zoo]]', west: 2591, east: 2640, north: 3290, south: 3256, mapId: '28'},
    {name: '[[West Ardougne]]', west: 2434, east: 2559, north: 3337, south: 3264, mapId: '28'},
    {name: '[[Miscellania]]', west: 2490, east: 2577, north: 3906, south: 3834, mapId: '28'},
    {name: '[[Mort\'ton]]', west: 3460, east: 3525, north: 3310, south: 3259, mapId: '28'},
    {name: '[[Observatory]]', west: 2423, east: 2481, north: 3201, south: 3149, mapId: '28'},
    {name: '[[Ourania Hunter area]]', west: 2438, east: 2478, north: 3255, south: 3216, mapId: '28'},
    {name: '[[Fight Arena (location)|Fight Arena]]', west: 2559, east: 2626, north: 3199, south: 3136, mapId: '28'},
    {name: '[[Silvarea]]', west: 3334, east: 3403, north: 3533, south: 3490, mapId: '28'},
    {name: '[[Seers\' Village]]', west: 2688, east: 2742, north: 3510, south: 3455, mapId: '28'},
    {name: '[[Galahad]]\'s house', west: 2608, east: 2618, north: 3482, south: 3472, mapId: '28'},
    {name: '[[Clock Tower (building)|Clock Tower]]', west: 2563, east: 2577, north: 3256, south: 3232, mapId: '28'},
    {name: '[[Ardougne Monastery]]', west: 2587, east: 2624, north: 3221, south: 3202, mapId: '28'},
    {name: 'Some house?', west: 2508, east: 2528, north: 3439, south: 3423, mapId: '-1'},
    {name: 'West of [[Varrock]]', west: 3111, east: 3119, north: 3455, south: 3448, mapId: '-1', member: false},
    {name: '[[Dragontooth Island]]', west: 3772, east: 3843, north: 3584, south: 3519, mapId: '28'},
    {name: '[[Hazelmere\'s island]]', west: 2632, east: 2705, north: 3118, south: 3072, mapId: '28'},
    {name: '[[War\'s Retreat]]', west: 3200, east: 3328, north: 10176 , south: 10112, mapId: '10003'},
    {name: '[[Barrows]]', west: 3520, east: 3584, north: 9728, south: 9664, mapId: '527'},
    {name: '[[Golden egg cave]]', west: 3840, east: 3904, north: 5120, south: 5056, mapId: '-1'},
    {name: '[Memorial to Guthix]]', west: 2250, east: 2320, north: 3572, south: 3539, mapId: '28'},
    {name: '[[Tarddiad]]', west: 2622, east: 2688, north: 12672, south: 12608, mapId: '-1'},
    {name: '[[Time Rune Temple]]', west: 3584, east: 3647, north: 4927, south: 4864, mapId: '755'},
    {name: '[[Crafting Guild]]', west: 2913, east: 2944, north: 3293, south: 3267, mapId: '28', member: false},
    {name: '[[Makeover Mage]]\'s house', west: 2914, east: 2922, north: 3325, south: 3318, mapId: '28', member: false},
    {name: '[[Golden palace]]', west: 2112, east: 2176, north: 6976, south: 6912, mapId: '-1'},
    {name: '[[Underground Pass (dungeon)|Iban\'s Lair]]', west: 2112, east: 4544, north: 4735, south: 4544, mapId: '209'},
    {name: '[[Piscatoris south mine]]', west: 2320, east: 2346, north: 3649, south: 3636, mapId: '28'},
    {name: '[[Uzer mine]]', west: 3456, east: 3468, north: 3143, south: 3134, mapId: '28'},
    {name: '[[Garden of Kharid]]', west: 3309, east: 3340, north: 3324, south: 3287, mapId: '28', member: false},
    {name: '[[]]', west: null, east: null, north: null, south: null, mapId: '-1'},
    {name: '[[]]', west: null, east: null, north: null, south: null, mapId: '-1'},
    {name: '[[]]', west: null, east: null, north: null, south: null, mapId: '-1'},
    {name: '[[]]', west: null, east: null, north: null, south: null, mapId: '-1'},
];

const ignoredLocations = [
    {name: 'Senntisten instance (Twilight of the gods)', west: 1595, east: 2049, north: 2054, south: 1791, mapId: '-1'},
    {name: 'Senntisten instance (City of Senntisten)', west: 514, east: 900, north: 529, south: 129, mapId: '-1'},
    {name: 'Mort Myre Swamp instance', west: 1984, east: 2079, north: 5056, south: 4990, mapId: '-1'},
    {name: 'Mort Myre Swamp instance', west: 2240, east: 2496, north: 5056, south: 4992, mapId: '-1'},
    {name: 'Mort Myre Swamp instance', west: 3778, east: 3969, north: 7746, south: 7550, mapId: '-1'},
    {name: 'Mort Myre Swamp instance', west: 2688, east: 2752, north: 5056, south: 4992, mapId: '-1'},
    {name: 'Fort Forinthry instance', west: 1280, east: 1344, north: 1536, south: 1472, mapId: '-1'},
    {name: 'Fort Forinthry instance 2', west: 1152, east: 1408, north: 2240, south: 2111, mapId: '-1'},
    {name: 'Wizards tower instance', west: 1153, east: 1216, north: 4864, south: 4800, mapId: '-1'},
    {name: 'South Falador instance', west: 2612, east: 2861, north: 6470, south: 6323, mapId: '-1'},
    {name: 'South Falador instance', west: 3496, east: 3585, north: 7107, south: 7039, mapId: '-1'},
    {name: 'South Falador instance', west: 3496, east: 3585, north: 7107, south: 7039, mapId: '-1'},
    {name: 'lighthouse copy', west: 2415, east: 2496, north: 4634, south: 4544, mapId: '-1'},
    {name: '[[Guthixian ruins]]', west: 1719, east: 1780, north: 6076, south: 5970, mapId: '-1'},
    {name: '[[Guthixian ruins]]', west: 1980, east: 2045, north: 6076, south: 6017, mapId: '-1'},
    {name: '[[Ancient Cavern Instance]]', west: 1666, east: 1713, north: 5311, south: 5253, mapId: '-1'},
    {name: '[[Rock island prison instance]]', west: 2752, east: 2944, north: 1536, south: 1472, mapId: '-1'},
    {name: '[[Dorgesh-Kaan instance]]', west: 2432, east: 2495, north: 4351, south: 4288, },
    {name: '2018 halloween', west: 4864, east: 4992, north: 9408, south: 9344, },
    {name: 'Annarkarl cutscene', west: 4288, east: 4352, north: 5760, south: 5696, },
    {name: 'Varrock part cutscene', west: 2432, east: 2560, north: 6528, south: 6335, },
    {name: 'Yanille part cutscene', west: 2880, east: 2944, north: 4789, south: 4672, },
    {name: 'Yanille part cutscene', west: 2880, east: 2944, north: 4789, south: 4672, },
    {name: '[[Mort\'ton]]', west: 2625, east: 2687, north: 5044, south: 4988, mapId: '28'},
    {name: 'Boat cutscene - Stolen hearts', west: 1280, east: 1408, north: 4928, south: 4800, mapId: '-1'},
    {name: 'Yanille - submarine', west: 3584, east: 3648, north: 5824, south: 5760, mapId: '-1'},
    {name: 'Karamja copy', west: 2496, east: 2560, north: 4608, south: 4544, mapId: '-1'},
    {name: 'Draynor village destroyed', west: 3840, east: 3904, north: 5504, south: 5440, mapId: '-1'},
    {name: 'Drill demon randon event', west: 3136, east: 3200, north: 4864, south: 4800, mapId: '-1'},

];
const template = `{{ObjectLocLine|name={{NAME}}|loc={{LOCATION}}{{FLOOR}}{{MEMBER}}{{LOCATIONS}}|mapID={{MAPID}}{{PLANE}}}}`;

const template2 = `|map={{Object map|mapID={{MAPID}}{{PLANE}}|objectid={{OBJECTID}}{{LOCATIONS}}}}`
if(typeof ids[0] == 'object'){
    for(let id of ids){
        handleGroup(id)
    }
}else{
    handleGroup(ids)
}


async function handleGroup(ids){
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

}

function formatData(data,multipleIds) {

    let resultsTable = [];
    for (let i = 0; i < data.length; i++) {

        let tempValue = `|{OBJECTID}x:${(data[i].i * 64 + data[i].x)},y:${(data[i].j * 64 + data[i].y)}`;
        //{{Object map|mapID=-1|1494,5227|1502,5222|group}
        tempValue = tempValue.replace('{OBJECTID}',multipleIds ? `objectid:${data[i].id},` : '')
        resultsTable.push(tempValue);
    }
    return resultsTable;
}

async function getRemoteData(id) {
    if(!goOnline){
        throw new Error(` ${id} Not found locally`);
    }
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

function getMorphIds(id){
    if(morph_mapping === undefined){
        const path = `${localDataLocation}/generated/morphs.json`
        morph_mapping = JSON.parse(fs.readFileSync(path, 'utf8'));
    }
    return id.toString() in morph_mapping ? morph_mapping[id.toString()] : []
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
            console.error(error + " Directly");
        }
            const morphs = getMorphIds(id)
            if(morphs.length == 0){
                console.log('no morphs')
            }
            for(const morph of morphs){
                try {
                    console.log('trying morph')
                    data = data.concat(await getData(morph));
                } catch (error) {
                    console.error(error + " Morph");
                }
            }

    }

    data.sort(compareItems)
    let tempData = {};
    for (let item of data) {
        let found = 0;
        let dataY = (item.j * 64 + item.y);
        let dataX = (item.i * 64 + item.x);
        for (let location of locations) {
            if(found >0){
                continue;
            }
            if (dataX >= location.west && dataX <= location.east && dataY >= location.south && dataY <= location.north) {
                item = await updateItemBasedOnLocation(item, location)
                const named = location.name + ':::::' + location.mapId + ':::::' + ((Object.hasOwn(location, 'member') ? location['member'] : defaultmember) ? 1 : 0);
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
        let [locationName, mapId, member] = key.split(':::::');
        for (let [plane, locationData] of Object.entries(data)) {
            let fakePlane = plane.indexOf('-fake') > -1
            plane = plane.replace('-fake','');
            const floorString = plane > 0 ? " ({{FloorNumber|" + ((+plane) + 1) + "}})" : ''
            const planeString = !fakePlane && plane > 0 ? "|plane=" + plane : ''
            if (!useTemplate2) {
                const memberText = member == 1 ? `|mem = Yes` : '';
                results.push(
                    template.replaceAll('{{LOCATIONS}}', formatData(locationData,ids.length > 1).toString().replaceAll(",|", "|"))
                        .replaceAll('{{LOCATION}}', locationName)
                        .replaceAll('{{MAPID}}', mapId)
                        .replaceAll('{{FLOOR}}', floorString)
                        .replaceAll('{{OBJECTID}}', locationData[0].id)
                        .replaceAll('{{NAME}}', sceneryName)
                        .replaceAll('{{PLANE}}', planeString)
                        .replaceAll('{{MEMBER}}', memberText)
                )
                continue;
            }
            results.push(
                template2.replaceAll('{{LOCATIONS}}', formatData(locationData,ids.length > 1).toString().replaceAll(",|", "|"))
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


async function updateItemBasedOnLocation(item, location){
    if(location.name === '[[Anachronia]]'){
        //Coordinates for Anachronia are offset by (-23*64,31*64).
        item.j = item.j+31
        item.i = item.i-23
    }else if(location.mapId !== '-1') {
        let response = await transformBasedOnBounds(location, item, item.plane)
        if(!response.transformed && item.plane > 0){
            response = await transformBasedOnBounds(location, item, 0)
            console.log('transform again!')
        }
        item = response.item
    }
    return item
}

async function transformBasedOnBounds(location, item, plane){
    bounds = await getBounds(location.mapId)
    transformed = false;
        for (let bound of bounds){
            if(bound.plane !== plane){
                continue;
            }

            let dataY = (item.j * 64 + item.y);
            let dataX = (item.i * 64 + item.x);

            if (dataX >= bound.src.west && dataX <= bound.src.east && dataY >= bound.src.south && dataY <= bound.src.north) {
                let diffWest = bound.src.west-bound.dst.west;
                let diffNorth = bound.src.north-bound.dst.north;
                item.i= item.i-Math.floor(diffWest/64)
                item.j= item.j-Math.floor(diffNorth/64)

                if(item.plane == plane){
                item.plane += '-fake'
                }

                if(Math.floor(diffWest/64) !== diffWest/64){
                    item.x = item.x-(diffWest/64-Math.floor(diffWest/64))*64;
                }

                if(Math.floor(diffNorth/64) !== diffNorth/64){
                    item.y = item.y-(diffNorth/64-Math.floor(diffNorth/64))*64;
                }   
                transformed = true
            }
        }
        return {item: item, transformed: transformed}
}

async function getLocalMapData() {
    const path = `${localDataLocation}/map_zones.json`
    return JSON.parse(fs.readFileSync(path, 'utf8'));
}

async function getBounds(mapId){
    let data = await getLocalMapData();
    return data.find(x => x.id == mapId)?.bounds;
}