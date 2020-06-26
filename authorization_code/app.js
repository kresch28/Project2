/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */

const express = require('express');
const http = require('http');
const https = require('https');
const fs = require('fs');

const serverless = require('serverless-http');
var request = require('request'); // "Request" library
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// let webhook = require('./webhook');

const httpsOptions = {
  key: fs.readFileSync('../security/key.pem'),
  cert: fs.readFileSync('../security/cert.pem')
}

var client_id = '6339d835dda0488ea37720c3ac51dba5'; // Your client id
var client_secret = '3613bd7077714acfa53d7b4ee182ccf7'; // Your secret
var redirect_uri = 'https://localhost:8443/callback'; // Your redirect uri


if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
  //localStorage = new LocalStorage();
}
/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';

var app = express();

app.set('view engine', 'html');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'))
   .use(cors())
   .use(cookieParser());
app.use(express.static(__dirname + '/public/js'));
app.use(express.static(__dirname + '/public/css'));

var userCredentialsStoredInMemory = {};



app.get('/login', function(req, res) {

  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'user-read-private user-read-email playlist-read-private user-library-read user-library-modify user-read-currently-playing playlist-read-collaborative user-read-recently-played user-read-playback-state playlist-modify-public playlist-modify-private';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

app.get('/callback', function(req, res) {

  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/player.html' +
        querystring.stringify({
          error: 'state_mismatch'
        }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        userCredentialsStoredInMemory.access_token = body.access_token;
        userCredentialsStoredInMemory.refresh_token = body.refresh_token;
        var access_token = body.access_token,
            refresh_token = body.refresh_token;

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          console.log(body);
          userCredentialsStoredInMemory.body = body;
        });

        // we can also pass the token to the browser to make requests from there
        /*res.redirect('/#' +
            querystring.stringify({
              access_token: access_token,
              refresh_token: refresh_token,
            }));*/

        /*localStorage.setItem('name', response.display_name);
        localStorage.setItem('email', response.email);
        time = new Date().getTime() + 60000;
        localStorage.setItem('time', JSON.stringify(time));*/
        //res.json(userCredentialsStoredInMemory);

        res.redirect('/player.html');


      } else {
        res.redirect('/#' +
            querystring.stringify({
              error: 'invalid_token'
            }));
      }


    });
  }
});


app.post('/player', function (req, res) {
  res.json({status: 200, userCredentialsStoredInMemory});
});

/*app.post('/result', function (req, res) {
  res.send(req.body);
  // res.redirect('/result.html');
});*/


app.get('/refresh_token', function(req, res) {

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });

  /* GOOGLE SPEECH API

  const recorder = require('node-record-lpcm16');

  const speech = require('@google-cloud/speech');

// Creates a client
  const client = new speech.SpeechClient();

  const encoding = 'Encoding of the audio file, e.g. LINEAR16';
  const sampleRateHertz = 16000;
  const languageCode = 'BCP-47 language code, e.g. en-US';

  const request = {
    config: {
      encoding: encoding,
      sampleRateHertz: sampleRateHertz,
      languageCode: languageCode,
    },
    interimResults: false, // If you want interim results, set this to true
  };

// Create a recognize stream
  const recognizeStream = client
      .streamingRecognize(request)
      .on('error', console.error)
      .on('data', data =>
          process.stdout.write(
              data.results[0] && data.results[0].alternatives[0]
                  ? `Transcription: ${data.results[0].alternatives[0].transcript}\n`
                  : '\n\nReached transcription time limit, press Ctrl+C\n'
          )
      );

// Start recording and send the microphone input to the Speech API.
// Ensure SoX is installed, see https://www.npmjs.com/package/node-record-lpcm16#dependencies
  recorder
      .record({
        sampleRateHertz: sampleRateHertz,
        threshold: 0,
        // Other options, see https://www.npmjs.com/package/node-record-lpcm16#options
        verbose: false,
        recordProgram: 'rec', // Try also "arecord" or "sox"
        silence: '10.0',
      })
      .stream()
      .on('error', console.error)
      .pipe(recognizeStream);

  console.log('Listening, press Ctrl+C to stop.');*/



});
/* DIALOGFLOW */
const url ="";
const projectId = 'project2-1587310134234';
const sessionId = '123456';
const queries = [];
const languageCode = 'en';

const dialogflow = require('dialogflow');

// Instantiates a session client
const sessionClient = new dialogflow.SessionsClient();
const client = new dialogflow.AgentsClient();

const {Storage} = require('@google-cloud/storage');
const keyFilename = 'C:/Users/Kathi/Downloads/project2-1587310134234-92576f4cc506.json'

async function detectIntent(projectId, sessionId, query, contexts, languageCode) {
  // The path to identify the agent that owns the created intent.
  /*const sessionPath = sessionClient.projectAgentSessionPath(
      projectId,
      sessionId
  );
  sessionClient.projectAgentSessionPath is not a function
*/

  // Instantiates a client. If you don't specify credentials when constructing
// the client, the client library will look for credentials in the
// environment.
  const storage = new Storage({projectId, keyFilename});

// Makes an authenticated API request.
  try {
    const [buckets] = await storage.getBuckets();

    console.log('Buckets:');
    buckets.forEach((bucket) => {
      console.log(bucket.name);
    });
  } catch (err) {
    console.error('ERROR:', err);
  }

  // The text query request.
  const request = {
    //session: sessionPath,
    queryInput: {
      text: {
        text: query,
        languageCode: languageCode,
      },
    },
  };

  if (contexts && contexts.length > 0) {
    request.queryParams = {
      contexts: contexts,
    };
  }

  const responses = await sessionClient.detectIntent(request);
  return responses[0];
}

async function executeQueries(projectId, sessionId, queries, languageCode) {
  // Keeping the context across queries let's us simulate an ongoing conversation with the bot
  let context;
  let intentResponse;
  console.log(queries);
  for (const query of queries) {
    try {
      console.log(`Sending Query: ${query}`);
      intentResponse = await detectIntent(
          projectId,
          sessionId,
          query,
          context,
          languageCode
      );
      console.log('Detected intent');
      console.log(
          `Fulfillment Text: ${intentResponse.queryResult.fulfillmentText}`
      );
      // Use the context from this response for next queries
      context = intentResponse.queryResult.outputContexts;
    } catch (error) {
      console.log(error);
    }
  }
}

queries.push("22");

app.post('/player', function(req, res) {
  executeQueries(projectId, sessionId, queries, languageCode);
  res.redirect('/#' +
      querystring.stringify({
        projectId: projectId,
      }));
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.json({ status: projectId })
});


var httpServer = http.createServer(app);
var httpsServer = https.createServer(httpsOptions, app);

httpServer.listen(8080);
console.log('Listening on 8443');
httpsServer.listen(8443);
/*console.log('Listening on 8888');
app.listen(8888);*/


