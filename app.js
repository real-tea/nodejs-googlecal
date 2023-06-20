const { google } = require("googleapis");
const fs = require("fs");

// Load credentials from credentials.json
try{
const credentials = JSON.parse(fs.readFileSync("credentials.json", {encoding : "utf8"}));

// Create an OAuth2 client
const { client_secret, client_id, redirect_uris } = credentials.installed;
const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

// Check for valid tokens
// fs.readFile('token.json', (err, token) => {
//     if (err) {
//         getAccessToken(oAuth2Client);
//     } else {
//         oAuth2Client.setCredentials(JSON.parse(token));
//         listEvents();
//     }
// });

fs.readFile('token.json', 'utf8', (err, token) => {
    if (err || !token) {
        getAccessToken(oAuth2Client);
    } else {
        oAuth2Client.setCredentials(JSON.parse(token));
        listEvents();
    }
});


// Get access token
function getAccessToken(oAuth2Client) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/calendar.readonly']
    });

    console.log("Authorize this app by visiting:", authUrl);

    const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });

    readline.question("Enter the code from the page here: ", code => {
        readline.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error retrieving access token:', err);
            oAuth2Client.setCredentials(token);
            fs.writeFile('token.json', JSON.stringify(token), err => {
                if (err) return console.error('Error writing token to file:', err);
                console.log('Token stored in token.json');
                listEvents();
            });
        });
    });
}

// List upcoming events
function listEvents() {
    const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });
    calendar.events.list({
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime'
    }, (err, res) => {
        if (err) return console.error("Error retrieving events:", err);
        const events = res.data.items;
        if (events.length) {
            console.log('Upcoming events:');
            events.forEach(event => {
                const start = event.start.dateTime || event.start.date;
                console.log(`${start} - ${event.summary}`);
            });
        } else {
            console.log('No upcoming events found.');
        }
    });
}
}catch(err){
    console.log(err)
}