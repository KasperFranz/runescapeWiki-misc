const plane = 0;
// Example usage
const ids = [120406];
getIDsAndCoords(ids, plane)
    .then(results => {
        console.log('Results:', results);
    })
    .catch(error => {
        console.error('Error:', error);
    });

function formatData(data) {

    let resultsTable = [];
    for (let i = 0; i < data.length; i++) {
        let tempValue = `|x:${(data[i].i * 64 + data[i].x)},y:${(data[i].j * 64 + data[i].y)}`;
        //{{Object map|mapID=-1|1494,5227|1502,5222|group=3}}
        resultsTable.push(tempValue);
    }
    return resultsTable;
}

async function getIDsAndCoords(ids, plane) {
    let results = [];

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

            let data = await response.json();

            if (plane !== false) {
                data = data.filter(item => item.plane === plane);
            }


            data.sort(function (a, b) {
                return a.plane - b.plane;
            });

            // In Senntisten
            const senntisen = data.filter(item => (item.i * 64 + item.x) > 1537 && (item.i * 64 + item.x) < 2100 && (item.j * 64 + item.y) < 1360 && (item.j * 64 + item.y) > 1150);

            //In The Zamorakian Undercity
            const underCity = data.filter(item => (item.i * 64 + item.x) > 1600 && (item.i * 64 + item.x) < 1790 && (item.j * 64 + item.y) < 1790 && (item.j * 64 + item.y) > 1500);

            //In The Senntisten Asylum
            const asylum = data.filter(item => (item.i * 64 + item.x) > 1930 && (item.i * 64 + item.x) < 2038 && (item.j * 64 + item.y) < 1530 && (item.j * 64 + item.y) > 1420);


            results.push("Senntisten " + formatData(senntisen).toString().replaceAll(",|", "|"));
            results.push("underCity(740) " + formatData(underCity).toString().replaceAll(",|", "|"));
            results.push("asylum(738) " + formatData(asylum).toString().replaceAll(",|", "|"));

            results = results.filter(item => item.split(" ")[1].length > 0);
            if (results.length === 0) {
                results.push(formatData(data).toString().replaceAll(",|", "|"));
            }
        } catch (error) {
            console.error(error);
        }
    }

    return results;
}
