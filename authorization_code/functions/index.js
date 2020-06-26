const functions = require('firebase-functions');
/*const admin = require('firebase-admin');
admin.initializeApp();*/

var express = require('express'); // Express web server framework
// const serverless = require('serverless-http');
var request = require('request'); // "Request" library
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// let webhook = require('./webhook');

var client_id = '6339d835dda0488ea37720c3ac51dba5'; // Your client id
var client_secret = '3613bd7077714acfa53d7b4ee182ccf7'; // Your secret
var redirect_uri = 'https://project2test-9cd70.web.app//callback'; // Your redirect uri


/*if (typeof localStorage === "undefined" || localStorage === null) {
    var LocalStorage = require('node-localstorage').LocalStorage;
    localStorage = new LocalStorage('./../scratch');
}*/
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
app.use(express.static(__dirname + '../public'))
    .use(cors())
    .use(cookieParser());
app.use(express.static(__dirname + '../public/js'));
app.use(express.static(__dirname + '../public/css'));

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
        headers: {'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))},
        form: {
            grant_type: 'refresh_token',
            refresh_token: refresh_token
        },
        json: true
    };


    request.post(authOptions, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            var access_token = body.access_token;
            res.send({
                'access_token': access_token
            });
        }
    });
});

    app.post('/player', function(req, res) {
        executeQueries(projectId, sessionId, queries, languageCode);
        res.redirect('/#' +
            querystring.stringify({
                projectId: projectId,
            }));
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.json({ status: projectId })
    });


    exports.helloWorld = functions.https.onRequest(
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
        })
    );

    exports.widgets = functions.https.onRequest(app);

   /* console.log('Listening on 8888');
    app.listen(8888);
    module.exports = app;
    module.exports.handler = serverless(app);*/
