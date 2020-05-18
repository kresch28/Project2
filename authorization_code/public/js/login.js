console.log('login');
    function getHashParams() {
        var hashParams = {};
        var e, r = /([^&;=]+)=?([^&;]*)/g,
            q = window.location.hash.substring(1);
        while ( e = r.exec(q)) {
            hashParams[e[1]] = decodeURIComponent(e[2]);
        }
        return hashParams;
    }

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

    var userProfileSource = document.getElementById('user-profile-template').innerHTML,
        userProfileTemplate = Handlebars.compile(userProfileSource),
        userProfilePlaceholder = document.getElementById('user-profile');

    /*var userProfileSource_ = document.getElementById('user-profile-template_').innerHTML,
            userProfileTemplate_ = Handlebars.compile(userProfileSource_),
            userProfilePlaceholder_ = document.getElementById('user-profile');
  */
    var oauthSource = document.getElementById('oauth-template').innerHTML,
        oauthTemplate = Handlebars.compile(oauthSource),
        oauthPlaceholder = document.getElementById('oauth');

    var params = getHashParams();

    var access_token = params.access_token,
        refresh_token = params.refresh_token,
        error = params.error;

    if(window.localStorage.length > 0) {
        console.log(window.localStorage);
        oauthPlaceholder.innerHTML = oauthTemplate({
            access_token: window.localStorage.access_token,
            // refresh_token: refresh_token
        });
        userProfilePlaceholder.innerHTML = userProfileTemplate({
            display_name: window.localStorage.name,
            email: window.localStorage.email});
        $('#loggedin').show();

        $('.record').on('click', (e) => {
            console.log(this);
            e.stopPropagation();
            window.location.href = "http://localhost:8888/#access_token="+ window.localStorage.access_token+"&refresh_token="+window.localStorage.refresh_token
            //toggleStartStop();
        })

        /* FORM:
        var form = $('#searchForm');
        form.on('submit', (e) => {
            e.preventDefault();
            var input = $('#keyword');
            var keyword = input.val();
            console.log(keyword);


            $.ajax({
                url: "/player",
                type: 'POST',
                // headers: {'keyword' : keyword},
                success: function(response) {
                    console.log(response);
                    window.location.href = "http://localhost:8888/#access_token="+ window.localStorage.access_token+"&refresh_token="+window.localStorage.refresh_token
                }
            });
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
                                    var s = url.substring(31, 53);
                                    playerResult = s;
                                });
                                console.log("Player: "+playerResult);
                                $('#main-card').html("<iframe src='https://open.spotify.com/embed/track/"+playerResult+"' width='300' height='380' frameborder='0' allowtransparency='true' allow='encrypted-media'></iframe>")
                                $('#social').show();
                                bindListeners(playerResult);
                            }
                        });
        })*/
    }
    else {
        if (error) {
            alert('There was an error during the authentication');
        } else {
            if (access_token) {
                // render oauth info
                oauthPlaceholder.innerHTML = oauthTemplate({
                    access_token: access_token,
                    refresh_token: refresh_token
                });

                $.ajax({
                    url: 'https://api.spotify.com/v1/me',
                    headers: {
                        'Authorization': 'Bearer ' + access_token
                    },
                    success: function (response) {
                        userProfilePlaceholder.innerHTML = userProfileTemplate(response);

                        $('#login').hide();
                        $('#loggedin').show();
                    }
                });
            } else {
                // render initial screen
                $('#login').show();
                $('#loggedin').hide();

                document.onSpotifyWebPlaybackSDKReady = () => {
                    const token = 'BQBQxK1ERfyulyRJlg3QEfEt0CWvp6NqJJwd_IgApadW6CvQbbGiEo8hY7O5gplqWLhf9jPbQZ_0_PjBqu_eZkpA6ljUWTW1ZkIIZHcepzyzIwIxgU2SPLBqJNkikxFOO107cL_MjWHRO9XWKECIwlJSA25fyJe2qjsrRfW-xzOxVz6hYRw';
                    const player = new Spotify.Player({
                        name: 'Web Playback SDK Quick Start Player',
                        getOAuthToken: cb => {
                            cb(token);
                        }
                    });

                    // Error handling
                    player.addListener('initialization_error', ({message}) => {
                        console.error(message);
                    });
                    player.addListener('authentication_error', ({message}) => {
                        console.error(message);
                    });
                    player.addListener('account_error', ({message}) => {
                        console.error(message);
                    });
                    player.addListener('playback_error', ({message}) => {
                        console.error(message);
                    });

                    // Playback status updates
                    player.addListener('player_state_changed', state => {
                        console.log(state);
                    });

                    // Ready
                    player.addListener('ready', ({device_id}) => {
                        console.log('Ready with Device ID', device_id);
                    });

                    // Not Ready
                    player.addListener('not_ready', ({device_id}) => {
                        console.log('Device ID has gone offline', device_id);
                    });

                    // Connect to the player!
                    player.connect();
                };
            }

            document.getElementById('obtain-new-token').addEventListener('click', function () {
                $.ajax({
                    url: '/refresh_token',
                    data: {
                        'refresh_token': refresh_token
                    }
                }).done(function (data) {
                    access_token = data.access_token;
                    oauthPlaceholder.innerHTML = oauthTemplate({
                        access_token: access_token,
                        refresh_token: refresh_token
                    });
                });
            }, false);
        }


        // HELPER FUNCTIONS

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

    }
