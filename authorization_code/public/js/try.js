console.log("try");
(function() {

    /**  Web API Spech Recognition **/
    var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition
    var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList
    var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent

    var recognizing;
    var recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    reset();
    recognition.onend = reset;
    recognition.onresult = function (event) {
        console.log('recording successfully ' + event);

        for (var i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                $('#keyword').val(event.results[i][0].transcript);
                $('#keyword').attr("placeholder", event.results[i][0].transcript);
                console.log(event.results[i][0].transcript);
            }
        }
    }

    function reset() {
        recognizing = false;
        $('.record-info').html("Click to Speak");
    }
    function toggleStartStop() {
        if (recognizing) {
            console.log("recording stopped");
            recognition.stop();
            reset();
        } else {
            console.log("recording");
            recognition.start();
            recognizing = true;
            $('.record-info').html("Click to Stop");
        }
    }

    /** Google Speech API
     const recorder = include('node-record-lpcm16');

     // Imports the Google Cloud client library
     const speech = include('@google-cloud/speech');
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
    };*/


    /**
     * Obtains parameters from the hash of the URL
     * @return Object
     */
    if (typeof localStorage === "undefined" || localStorage === null) {
        var LocalStorage = require('node-localstorage').LocalStorage;
        localStorage = new LocalStorage('./scratch');
        //localStorage = new LocalStorage();
    }

    function getHashParams() {
        var hashParams = {};
        var e, r = /([^&;=]+)=?([^&;]*)/g,
            q = window.location.hash.substring(1);
        while ( e = r.exec(q)) {
            hashParams[e[1]] = decodeURIComponent(e[2]);
        }
        return hashParams;
    }

    var userProfileSource = document.getElementById('user-profile-template').innerHTML,
        userProfileTemplate = Handlebars.compile(userProfileSource),
        userProfilePlaceholder = document.getElementById('user-profile');

    var cardItemSource = document.getElementById('card-item-template').innerHTML,
        cardItemTemplate = Handlebars.compile(cardItemSource),
        cardItemPlaceholder = document.getElementById('card-item');

    var params = getHashParams();

    var access_token = params.access_token,
        refresh_token = params.refresh_token,
        error = params.error;

    if (error) {
        alert('There was an error during the authentication');
    } else {
        if (access_token) {
            // render oauth info
            /*oauthPlaceholder.innerHTML = oauthTemplate({
                access_token: access_token,
                refresh_token: refresh_token
            });*/

            $.ajax({
                url: 'https://api.spotify.com/v1/me',
                headers: {
                    'Authorization': 'Bearer ' + access_token
                },
                success: function(response) {
                    userProfilePlaceholder.innerHTML = userProfileTemplate(response);
                    // cardItemPlaceholder.innerHTML = cardItemTemplate();
                    localStorage.setItem('access_token', access_token);
                    $('#logged_out').hide();
                    $('#loggedin').show();
                    $('#card-item-result').show();
                    $('.record').on('click', (e) => {
                        e.stopPropagation();
                        toggleStartStop();
                    })

                    /*$('.record').on('click', (e) => {
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
                    })*/
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
                            console.log(value.context.uri);
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
            // render initial screen for app
            $('#logged_out').show();
            $('#loggedin').hide();
        }
    }

    var form = $('#searchForm');
    form.on('submit', (e) => {
        e.preventDefault();
        var input = $('#keyword');
        var keyword = input.val();
        console.log(keyword);

        //TODO ajax to server for dialog flow ajax request

        var playerResult = "";

        $.ajax({
            url: "https://api.spotify.com/v1/search?q="+keyword+"&type=track&market=US",
            type: 'GET',
            headers: {
                'Authorization': 'Bearer ' + access_token
            },
            success: function(response) {
                console.log(response.tracks.items);
                $.each(response.tracks.items, function (index, value)
                {
                    var url = value.external_urls.spotify;
                    // console.log(url);
                    var s = url.substring(31, 53);
                    playerResult = s;
                });
                console.log("Player: "+playerResult);
                $('#main-card').html("<iframe src='https://open.spotify.com/embed/track/"+playerResult+"' width='300' height='380' frameborder='0' allowtransparency='true' allow='encrypted-media'></iframe>")
                $('#social').show();
                bindListeners(playerResult);
            }
        });

        //$('#result').html("<iframe src='https://open.spotify.com/embed/album/"+playerResult+"' width='300' height='380' frameborder='0' allowtransparency='true' allow='encrypted-media'></iframe>")
    })



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


})();
