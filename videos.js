const {google} = require("googleapis");
const {Duration} = require("luxon");
const fs = require('node:fs');
const {Readable} = require('stream');
const {finished} = require('stream/promises');


require('dotenv').config()

const IMAGEDESCRIPTION = `== Summary ==
{{Fair use|link={{YT.LINK}}}}

[[Category:Media thumbnails]]
`
// noinspection UnnecessaryLabelJS JSAnnotator
const template = `{{Needs dialogue}}
{{Infobox Media
|name = {{YT.CLEANTITLE}}
|image = {{YT.IMAGE}}
|uploader = RuneScape
|date = {{YT.DATE}}
|type = video
|category = {{YT.CATEGORY}}
|subject = {{YT.SUBJECT}}
|participants = {{YT.PARTICIPANTS}}
|duration = {{YT.DURATION}}
|youtube = {{YT.LINK}}
}}
'''{{YT.TITLE}}''' was a [[video]] that was released on {{YT.DATE}}.

==Description==
<blockquote>
{{YT.DESCRIPTION}}
</blockquote>

{{DISPLAYTITLE:{{YT.CLEANTITLE}}}}
{{Restricted title|Cannot use pipe in titles}}`;

function getShortDetails(videoId){
    return getDetails(videoId, 'short')
}



function getVideoDetails(videoId) {
    return getDetails(videoId, 'video')
}

function getDetails(videoId, type) {
    const service = google.youtube('v3');
    service.videos.list({
        auth: process.env.GOOGLE_API_KEY,
        part: 'snippet,contentDetails',
        id: videoId
    }, function (err, data) {
        if (err) {
            console.error('Error: ' + err);
        }
        if (data) {
            printVideoDetails(data.data.items[0],type)
        }
    });
}

function formatDate(publishedAt) {
    const date = new Date(publishedAt);
    return '[[' + date.toLocaleDateString('en-GB', {
        month: 'long',
        day: 'numeric',
    }) + ']] [[' + date.getFullYear() + ']]';
}

function formatDuration(duration) {
    return Duration.fromISO(duration).toISOTime({suppressMilliseconds: true})
}


function formatCategory(title,type) {

    if(type === 'short'){
        return 'Shorts'
    }
    if (title.includes("Patch Notes")) {
        return 'Patch notes'
    }

    if (title.includes('Dev Diary')) {
        return 'Dev Diary';
    }

    if (title.includes('Teaser') || title.includes('Trailer')) {
        return 'trailer';
    }

    console.log("UNKNOWN category!");
    return '';
}

function formatName(title) {
    return title.replaceAll('|', '{{!}}');
}

function formatImageName(title) {
    return title.replaceAll('|', '-').replaceAll('#', '').replaceAll('!','').replaceAll('&','').replaceAll('  ',' ').replaceAll('?','-').replaceAll(':', '-')+ '.jpg';
}

function formatSubject(category, snippet) {
    switch (category) {
        case 'Patch notes':
            return patchNoteSubjects(snippet.publishedAt.substring(0, 10))
    }

    console.log('Unknown subject: ', category);

    return '';
}

function patchNoteSubjects(date) {
    const update = patchNoteFromDate(date);
    return '[[' + update + '|' + update.replace(new RegExp('Update:', "ig"), '') + ']]'

}

function patchNoteFromDate(date) {
    switch (date) {
        case '2024-05-13':
            return 'Update:High Contrast Mode & DXP - This Week In RuneScape'
        case '2024-05-20':
            return 'Update:2024 Player Survey & Gamejam - This Week In RuneScape'
        case '2024-05-28':
            return 'Update:Osseous Launch - This Week In RuneScape'
        case '2024-06-03':
        case '2024-06-04':
            return 'Update:Pride Events & Ultra+ Graphics - This Week In RuneScape'
        case '2024-06-10':
            return 'Update:Daemonheim Archaeology Site - This Week In RuneScape'
        case '2024-06-17':
            return 'Update:Zamorak God Armour Marketplace Bundle - This Week In RuneScape'
        case '2024-06-24':
            return 'Update:The Beach Is Here! - This Week In RuneScape'
        case '2024-07-01':
            return 'Update:Chill Beach Week - This Week In RuneScape'
        case '2024-07-08':
            return 'Update:Vintage Beachwear Marketplace Outfit - This Week In RuneScape'
        case '2024-07-29':
        case '2024-07-30':
            return 'Update:Summer Double XP - This Week In RuneScape'
        case '2024-08-05':
            return 'Update:Summer Sanctum Patch Week - This Week In RuneScape'
        case '2024-08-12':
            return 'Update:Mining & Smithing 110 Launching Today! - This Week In RuneScape'
        case '2024-08-19':
            return 'Update:110 Mining & Smithing Post-Launch - This Week In RuneScape'
        case '2024-08-29':
            return 'Update:August Patch Week - This Week In RuneScape'
        case '2024-09-02':
            return 'Update:New Necromancy Conjure - This Week In RuneScape'
        case '2024-09-09':
            return 'update:September Merch Drop - This Week In RuneScape'
        case '2024-09-16':
            return 'update:Ode of the Devourer Quest Launch - This Week In RuneScape'
        case '2024-09-23': 
            return 'update:Gate of Elidinis Launch Week - This Week In RuneScape'
        case '2024-09-30': 
            return 'Update:Gate of Elidinis Patch Week - This Week In RuneScape'
        case '2024-10-07': 
            return 'Update:October Patch Week - This Week In RuneScape'
        case '2024-10-21':
            return 'Update:Gate of Elidinis Drop Rates - This Week In RuneScape'
        case '2024-10-28':
            return 'Update:Group Ironman Launch - This Week In RuneScape'
        case '2024-11-04':
            return 'Update:New Slayer Mobs & Premier Refresh - This Week In RuneScape'
        case '2024-11-25':
            return 'Update:November PostJam Patch Week - This Week In RuneScape'
        case '2024-12-02':
        case '2024-12-03':
            return 'Update:\'Tis the Season , Christmas Village Returns - This Week In RuneScape'
        case '2024-12-10':
            return 'Update:110 Woodcutting and Fletching Launching Today! - This Week In RuneScape'
        case '2024-12-16':
            return 'Update:Shooting Star Refresh - This Week In RuneScape'
        case '2025-01-13':
            return 'Update:Beneath Scabaras\' Sands Quest Launch - This Week In RuneScape'
    }

    console.error('Uknown update')
    console.error('https://runescape.wiki/w/2024')
    return 'UNKNOWN!';
}

function getParticipants(category, snippet) {
    if (category === 'Patch notes') {
        return '[[Mod Lee]]'
    }

    return '';
}

function generateLink(videoId,type) {
    if(type==='short'){
        return 'https://www.youtube.com/shorts/' + videoId
    }
    return 'https://www.youtube.com/watch?v=' + videoId;
}

function getVideoLink(thumbnails) {
    if (thumbnails.maxres) {
        return thumbnails.maxres.url
    }
    if (thumbnails.standard) {
        return thumbnails.standard.url
    }
    if (thumbnails.high) {
        return thumbnails.high.url
    }

}

async function printVideoDetails(data,type) {
    const category = formatCategory(data.snippet.title,type)
    //console.log(data)
    const imageName = formatImageName(data.snippet.title)
    const ytLink = generateLink(data.id,type);
    const output = template
        .replaceAll('{{YT.CLEANTITLE}}', formatName(data.snippet.title))
        .replaceAll('{{YT.TITLE}}', data.snippet.title)
        .replaceAll('{{YT.IMAGE}}', imageName)
        .replaceAll('{{YT.DATE}}', formatDate(data.snippet.publishedAt))
        .replaceAll('{{YT.DURATION}}', formatDuration(data.contentDetails.duration))
        .replaceAll('{{YT.LINK}}', ytLink)
        .replaceAll('{{YT.DESCRIPTION}}', data.snippet.description.replaceAll('\n', '<br>\n').replaceAll('\n#', '\n<nowiki>#</nowiki>'))
        .replaceAll('{{YT.DURATION}}', data.snippet.duration)
        .replaceAll('{{YT.CATEGORY}}', category)
        .replaceAll('{{YT.SUBJECT}}', formatSubject(category, data.snippet))
        .replaceAll('{{YT.PARTICIPANTS}}', getParticipants(category, data.snippet));

    fs.writeFile('output/video/' + formatName(data.snippet.title) + '.md', output, err => {
        if (err) {
            console.error(err);
        }
    });

    //save image

    const stream = fs.createWriteStream('output/video/' + imageName);
    const {body} = await fetch(getVideoLink(data.snippet.thumbnails));
    await finished(Readable.fromWeb(body).pipe(stream));

    console.log(encodeURI(`https://runescape.wiki/w/{{RSWIKI.LINK}}?action=edit`.replaceAll('{{RSWIKI.LINK}}', formatImageName(data.snippet.title).replace('.jpg', '').replaceAll(' ', '_'))))
    console.log(encodeURI(`https://runescape.wiki/w/Special:Upload?wpDestFile={{IMAGE}}&wpUploadDescription={{IMAGE_DESC}}`.replaceAll('{{IMAGE}}', imageName.replaceAll(' ', '_')).replaceAll('{{IMAGE_DESC}}',IMAGEDESCRIPTION).replaceAll('{{YT.LINK}}',ytLink)))
}


// Patch notes
/*
getVideoDetails('uwxFKqJRMus'); //13 may
getVideoDetails('K94X0nsrUik'); //20 may
getVideoDetails('bE_PMKOcQeE');// 28 may
getVideoDetails('FFsgMAutFqo');// 3 june
getVideoDetails('RyaRDVFYses');// 10 june
getVideoDetails('pyslt2EFcPY');// 17 june
getVideoDetails('w7UrYSK3VbU');// 24 june
getVideoDetails('kcdyA0cDLt4');// 1 july
getVideoDetails('vPeTL2hC_h4') // 8 july

 */
//Dev diary
// getVideoDetails('GspAnFCsEQw'); // Dev Diary New Archaeology Dig Site - Daemonheim - RuneScape

// getVideoDetails('_LKmIJtDjU0')
// getVideoDetails('rn_9yv2odHU')

// getVideoDetails('ZbsTNJHyMMg')
//getVideoDetails('EKhwXwlJ7w8')
//getVideoDetails('2Dd-_lhcXxk')
//getVideoDetails('mnBsUtu3DQs')
//getShortDetails('xyuDRa1ivoM','shorts')
//getShortDetails('t6URqbdIdUk','shorts')
//getShortDetails('klJbBL5_x0Y','shorts')
//getShortDetails('plUEc9TZNvo')

//getVideoDetails('dbANyqb1DLI')
//getVideoDetails('ZrUP7th55gI')
//getVideoDetails('MXuAOazpsDo')
//getVideoDetails('y8qVYeeRHKk')
//getVideoDetails('ZGKu84HOic4')

// getVideoDetails('TEQTzCzX1lk')

// getVideoDetails('1Gq2QUp03NY')

// getShortDetails('wq5hoyRN9gI')
//getShortDetails('sDnVnFdTe0A')
//getVideoDetails('38MnO055lyw')
//getShortDetails('BapPbQ-a4ns')
//getShortDetails('tDdVnQOSr9E')
//getVideoDetails('asmzQVRlOKA')
//getShortDetails('WnUMz9zcv38')
//getShortDetails('xXMZc6SSAjg')
//getVideoDetails('Fi-AXZOErD8')
//getVideoDetails('VHwOcMrjP9E')
//getShortDetails('Lueiz5k0eDI')

// getVideoDetails('NKWZPQIIc1U')
// getShortDetails('A7xnKZNq_D8')
// getVideoDetails('gYZljbrvsm0')

//getVideoDetails('Z2xe2_odnrc')

getShortDetails('EOUO1cPX-9E')