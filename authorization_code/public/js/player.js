console.log("Player");
if (typeof localStorage === "undefined" || localStorage === null) {
    var LocalStorage = require('node-localstorage').LocalStorage;
    localStorage = new LocalStorage('./scratch');
    //localStorage = new LocalStorage();
}

var userProfileSource = document.getElementById('user-profile-template').innerHTML,
    userProfileTemplate = Handlebars.compile(userProfileSource),
    userProfilePlaceholder = document.getElementById('user-profile');

var cardItemSource = document.getElementById('card-item-template').innerHTML,
    cardItemTemplate = Handlebars.compile(cardItemSource),
    cardItemPlaceholder = document.getElementById('card-item');

var access_token;

$.post( "/player", function(loginData) {

}).done(function(data) {
        if(data.status === 200) {
            console.log(data.userCredentialsStoredInMemory);
            userProfilePlaceholder.innerHTML = userProfileTemplate({
                display_name: data.userCredentialsStoredInMemory.body.display_name,
                email: data.userCredentialsStoredInMemory.body.email});
            localStorage.setItem('access_token', data.userCredentialsStoredInMemory.access_token);
            localStorage.setItem('refresh_token', data.userCredentialsStoredInMemory.refresh_token);
            localStorage.setItem('name', data.userCredentialsStoredInMemory.body.display_name);
            localStorage.setItem('email', data.userCredentialsStoredInMemory.body.email);
            time = new Date().getTime() + 60000;
            localStorage.setItem('time', JSON.stringify(time));

            access_token = data.userCredentialsStoredInMemory.access_token;

            $( window ).on( "load", function() {
                toggleStartStop();
            })
            /*$('.record').on('click', (e) => {
                e.stopPropagation();
                toggleStartStop();
            })*/

        } else {
            //logged out
        }
    })
    .fail(function() {
        //error (bad connection)
    });

var itemRequest = [];

var form = $('#searchForm');
var input = $('#keyword');
/*form.on('submit', (e) => {
    var keyword = itemRequest;

    /!*$.post('/result', itemRequest).done(function (data) {
        alert(data);
        top.location.href = "/result.html"
    });*!/

    /!*$.ajax({
        type: "POST",
        url: "/result",
        data: form.serializeArray(),
        success: function() {
            alert(this.data);
            top.location.href = "/result.html"
        }
    }).done(response => {
        console.log(response)
    });*!/

    //$('#main-card').html("<iframe src='https://open.spotify.com/embed/track/"+playerResult+"' width='300' height='380' frameborder='0' allowtransparency='true' allow='encrypted-media'></iframe>")
    //$('#social').show();
});*/

/**  Web API Spech Recognition **/
var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition
var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList
var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent


var item = " ";
var artist = " ";


var recognizing;
var recognition = new webkitSpeechRecognition();
recognition.continuous = true;
reset();
recognition.onspeechend = function() {
    recognition.stop();
    console.log('Speech recognition has stopped.');
    reset();
}
// recognition.onend = reset;
recognition.onresult = function (event) {
    console.log('recording successfully ' + event);

    for (var i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
            $('#keyword').val(event.results[i][0].transcript);
            $('#keyword').attr("placeholder", event.results[i][0].transcript);
            item = event.results[i][0].transcript;
            /*itemRequest.push(item);
            console.log(itemRequest);
            if(event.results[i][0].transcript.includes('play')){
                itemRequest.pop();
                console.log('included play: '+ event.results[i][0].transcript);
                console.log("starting at "+event.results[i][0].transcript.indexOf("play"));
                // var start = event.results[i][0].transcript.indexOf("play") + 5;
                // console.log("Item: "+event.results[i][0].transcript.split(" ", 1)[1]);
                title = event.results[i][0].transcript.split(" ", 2)[1];
                console.log(title);
                itemRequest.push(title);
                console.log(itemRequest);
            }
            if(event.results[i][0].transcript.includes('from')){
                if(itemRequest.title == null) {
                    itemRequest.pop();
                    if(event.results[i][0].transcript.includes('play')){
                        // console.log("Item: "+event.results[i][0].transcript.split(" ", 1)[1]);
                        title = event.results[i][0].transcript.split(" ", 2)[1];
                        console.log(title);
                        itemRequest.push(title);
                        console.log(itemRequest);
                    }
                    else {
                        var startTitle = event.results[i][0].transcript.indexOf(" ");
                        console.log(startTitle);
                        title = event.results[i][0].transcript.slice(0,startTitle);
                        console.log("Item: " + title);
                        itemRequest.push(title);
                    }
                }
                console.log('included from: '+ event.results[i][0].transcript);
                console.log(itemRequest);
                var startArtist = event.results[i][0].transcript.indexOf("from") + 5;

                console.log("Artist: " + event.results[i][0].transcript.slice(startArtist));
                artist = event.results[i][0].transcript.slice(startArtist);
                itemRequest.push(artist);
                console.log(itemRequest);
            }*/
        }
    }
    form.submit();
}

function reset() {
    recognizing = false;
    $('.record-info').html("Click to Speak");
}
function toggleStartStop() {
    /*
    if (recognizing) {
        console.log("recording stopped");
        recognition.stop();
        reset();
    } else {*/
        console.log("recording");
        recognition.start();
        recognizing = true;
        $('.record-info').html("Click to Stop");
    //}
}

/*
userProfilePlaceholder.innerHTML = userProfileTemplate(storageSet);

var params = getHashParams();

var access_token = params.access_token,
    refresh_token = params.refresh_token,
    error = params.error;

if (error) {
    alert('There was an error during the authentication');
    localStorage.clear();
} else {
    if (access_token) {
        // render oauth info
        /!*oauthPlaceholder.innerHTML = oauthTemplate({
            access_token: access_token,
            refresh_token: refresh_token
        });*!/

        $.ajax({
            url: 'https://api.spotify.com/v1/me',
            headers: {
                'Authorization': 'Bearer ' + access_token
            },
            success: function(response) {
                userProfilePlaceholder.innerHTML = userProfileTemplate(response);
                // cardItemPlaceholder.innerHTML = cardItemTemplate();


                console.log(response);
                $('#logged_out').hide();
                $('#loggedin').show();
                $('#card-item-result').show();
                $('.record').on('click', (e) => {
                    e.stopPropagation();
                    toggleStartStop();
                })

                if (storageSet == true && new Date().getTime() > parseInt(localStorage.time)) {
                    // If the item is expired, delete the item from storage
                    // and return null
                    console.log(storageSet);
                    localStorage.clear();
                    storageSet = false;
                    console.log('time is over');
                    console.log(storageSet);
                }
                if(localStorage.length == 0 && storageSet == undefined){
                    console.log(storageSet);
                    localStorage.setItem('access_token', access_token);
                    localStorage.setItem('refresh_token', refresh_token);
                    localStorage.setItem('name', response.display_name);
                    localStorage.setItem('email', response.email);
                    time = new Date().getTime() + 60000;
                    localStorage.setItem('time', JSON.stringify(time));
                    storageSet = true;
                    console.log("new local storage");
                    console.log(storageSet);
                }
                /!*$('.record').on('click', (e) => {
                    e.stopPropagation();
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

                    console.log('Listening, press Ctrl+C to stop.');
                })*!/
            },
            error: function () {
                console.log("access token could be outdated")
                localStorage.clear();
                $('#logged_out').show();
                $('#loggedin').hide();
            }
        });
        $.ajax({
            url: 'https://api.spotify.com/v1/me/player/recently-played',
            headers: {
                'Authorization': 'Bearer ' + access_token
            },
            success: function(response) {
                playerUri = "";
                resultType = "";
                $.each(response.items, function (index, value)
                {
                    if(value.context != null && index == 0){
                        //console.log(value);
                        console.log(value.context.uri.split(':')[2]);
                        playerUri = value.context.uri.split(':')[2];
                        console.log(value.context.type);
                        resultType = value.context.type;
                    }
                    $('#context-card').html("<iframe src='https://open.spotify.com/embed/"+resultType+"/"+playerUri+"' width='300' height='380' frameborder='0' allowtransparency='true' allow='encrypted-media'></iframe>")
                });

            }
        });

    } else {
        // render initial screen
        $('#logged_out').show();
        $('#loggedin').hide();
    }
}
*/

var playlistId = "";
function bindListeners(playerResult) {
    /*var add = $('#add');
    add.on('click', (e) => {
        e.preventDefault();

    });
    */
    getPlayLists();
    $('.dropdown-menu').on('click', 'button.addTo', function() {
        var playlistID = $(this).attr('class');
        // console.log(playlistID.substring(20,42));
        playlistId = playlistID.substring(20,42);
        $.ajax({
            url: "https://api.spotify.com/v1/playlists/"+playlistId+"/tracks?uris=spotify%3Atrack%3A"+playerResult+"",
            type: 'POST',
            headers: {
                'Authorization': 'Bearer ' + access_token
            },
            error: function() {
                alert('error!')
            }
        });
    });
    var likeButton = $('#like');
    likeButton.on("click", (e) => {
            e.preventDefault();
            $.ajax({
                url: "https://api.spotify.com/v1/me/tracks?ids="+playerResult+"",
                type: 'PUT',
                headers: {
                    'Authorization': 'Bearer ' + access_token
                },
                success: function(){
                    alert('Track added to liked songs!')
                },
                error: function() {
                    alert('error!')
                }
            });
        }
    );

    var shareButton = $('#share');
    shareButton.on("click", (e) => {
        var url = window.location.href;
        if (navigator.share) {
            navigator.share({
                title: 'Player',
                url: url
            }).then(() => {
                console.log('Thanks for sharing!');
            })
                .catch(console.error);
        } else {
            console.log("couldn't share");
            console.log(navigator);
            console.log(navigator.share);
        }
        e.preventDefault();
    });
}

function getPlayLists(){
    $.ajax({
        url: "https://api.spotify.com/v1/me/playlists",
        type: 'GET',
        headers: {
            'Authorization': 'Bearer ' + access_token
        },
        success: function(response) {
            // console.log(response.items);
            $.each(response.items, function (index, value)
            {
                var id = value.id;
                // TODO set playlist Id to choosen one from dropdown
                playlistId = id;
                playlistName = value.name;
                $('.dropdown-menu').append("<button class='addTo dropdown-item "+playlistId+"'>"+playlistName+"</button>")
            });
        }
    });
}
