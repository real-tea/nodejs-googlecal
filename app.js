const {google} = require("googleapis");
const fs = require('fs')



//*TODO  : LOAD FILE CREDENTIALS ( USE FS ?)
const credentials = JSON.parse(fs.readFileSync('credentials.json'));


//* create an oauth2 client 

const { client_secret , client_id , redirect_uris } = credentials.installed;
const oAuth2Client = new google.auth.OAuth2(client_id , client_secret , redirect_uris[0]);


//* check for valid tokens

fs.readFile('token.json',(err , token)=> {
    if(err){
        getAccessToken(oAuth2Client);

    }else{
        oAuth2Client.setCredentials(JSON.parse(token));
        listEvents();
    }
})



//* storing token in token.json
function getAccessToken(oAuth2Client){
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type:'offline',
        scope :  ['https://www.googleapis.com/auth/calendar.readonly']
    });

    console.log("authorise this app by visiting : " , authUrl);
    const readline = require('readline').createInterface({
        input : process.stdin,
        output : process.stdout
    });

    readline.question("enter the code from the page here :",code => {
        readline.close();
        oAuth2Client.getToken(code , (err , token)=>{
            if(err) return console.error('Error retrieving access token', err);
            oAuth2Client.setCredentials(token);
            fs.writeFile('token.json', JSON.stringify(token),err=>{
                if(err) return console.error('Error writing token to file ' , err);
                console.log('Token strored in token.json');
                listEvents();
            })
        })
    })
}