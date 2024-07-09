const {google} = require("googleapis");
const {Duration} = require("luxon");
const fs = require('node:fs');
const {Readable} = require('stream');
const {finished} = require('stream/promises');


require('dotenv').config()

// noinspection UnnecessaryLabelJS JSAnnotator
const template = `https://runescape.wiki/w/{{RSWIKI.LINK}}
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

function getVideoDetails(videoId) {
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
            printVideoDetails(data.data.items[0])
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


function formatCategory(title) {

    if (title.includes("Patch Notes")) {
        return 'Patch notes'
    }

    if (title.includes('Dev Diary')) {
        return 'Dev Diary';
    }

    console.log("UNKNOWN subject!");
    return '';
}

function formatName(title) {
    return title.replaceAll('|', '{{!}}');
}

function formatImageName(title) {
    return title.replaceAll('|', '-').replaceAll('#', '').replaceAll(':', '') + '.jpg';
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
    return '[[' + update + '|' + update.replace('Update:', '') + ']]'

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
    }

    return 'UNKNOWN!';
}

function getParticipants(category, snippet) {
    if (category === 'Patch notes') {
        return '[[Mod Lee]]'
    }

    return '';
}

function generateLink(videoId) {
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

async function printVideoDetails(data) {
    const category = formatCategory(data.snippet.title)
    //console.log(data)
    const output = template
        .replaceAll('{{YT.CLEANTITLE}}', formatName(data.snippet.title))
        .replaceAll('{{YT.TITLE}}', data.snippet.title)
        .replaceAll('{{YT.IMAGE}}', formatImageName(data.snippet.title))
        .replaceAll('{{YT.DATE}}', formatDate(data.snippet.publishedAt))
        .replaceAll('{{YT.DURATION}}', formatDuration(data.contentDetails.duration))
        .replaceAll('{{YT.LINK}}', generateLink(data.id))
        .replaceAll('{{YT.DESCRIPTION}}', data.snippet.description.replaceAll('\n', '<br>\n').replaceAll('\n#', '\n<nowiki>#</nowiki>'))
        .replaceAll('{{YT.DURATION}}', data.snippet.duration)
        .replaceAll('{{YT.CATEGORY}}', category)
        .replaceAll('{{YT.SUBJECT}}', formatSubject(category, data.snippet))
        .replaceAll('{{YT.PARTICIPANTS}}', getParticipants(category, data.snippet))
        .replaceAll('{{RSWIKI.LINK}}', formatImageName(data.snippet.title).replace('.jpg', '').replaceAll(' ', '_'))

    console.log(data)

    fs.writeFile('output/video/' + formatName(data.snippet.title) + '.md', output, err => {
        if (err) {
            console.error(err);
        }
    });

    //save image

    const stream = fs.createWriteStream('output/video/' + formatImageName(data.snippet.title));
    const {body} = await fetch(getVideoLink(data.snippet.thumbnails));
    await finished(Readable.fromWeb(body).pipe(stream));
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
*/
getVideoDetails('vPeTL2hC_h4') // 8 july
//Dev diary
// getVideoDetails('GspAnFCsEQw'); // Dev Diary New Archaeology Dig Site - Daemonheim - RuneScape