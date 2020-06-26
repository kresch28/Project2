
var access_token = localStorage.getItem('access_token');

$(document).ready(function() {
    console.log('result');
});

$(document).ready(function() {
        toggleStartStop();
})

function getHashParams() {
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1);
    while ( e = r.exec(q)) {
        hashParams[e[1]] = decodeURIComponent(e[2]);
    }
    return hashParams;
}

const shareData = {
    title: 'Project2 IM',
    url: window.location.href,
}

var params = getHashParams();

var itemRequest = [];

const queryString = window.location.search;
console.log(queryString);
const urlParams = new URLSearchParams(queryString);
const keyword = urlParams.get('keyword')
console.log(keyword);

itemRequest.push(keyword);


if(keyword.includes('play')){
    itemRequest.pop();
    console.log('included play: '+ keyword);
    console.log("starting at "+keyword.indexOf("play"));
    // var start = event.results[i][0].transcript.indexOf("play") + 5;
    // console.log("Item: "+event.results[i][0].transcript.split(" ", 1)[1]);
    title = keyword.split(" ", 2)[1];
    console.log(title);
    itemRequest.push(title);
    console.log(itemRequest);
}
if(keyword.includes('from')){
    if(itemRequest.title == null) {
        itemRequest.pop();
        if(keyword.includes('play')){
            // console.log("Item: "+event.results[i][0].transcript.split(" ", 1)[1]);
            title = keyword.split(" ", 2)[1];
            console.log(title);
            itemRequest.push(title);
            console.log(itemRequest);
        }
        else {
            var startTitle = keyword.indexOf(" ");
            console.log(startTitle);
            title = keyword.slice(0,startTitle);
            console.log("Item: " + title);
            itemRequest.push(title);
        }
    }
    console.log('included from: '+ keyword);
    console.log(itemRequest);
    var startArtist = keyword.indexOf("from") + 5;

    console.log("Artist: " + keyword.slice(startArtist));
    artist = keyword.slice(startArtist);
    itemRequest.push(artist);
    console.log(itemRequest);
}


var playerResult = "";
if(itemRequest.length > 1){
    console.log('Artist is available');
    $.ajax({
        url: "https://api.spotify.com/v1/search?q="+itemRequest[0]+"&type=track&market=US",
        type: 'GET',
        headers: {
            'Authorization': 'Bearer ' + access_token
        },
        success: function(response) {
            let url, s;
            $.each(response.tracks.items, (i, item) => {
                // console.log(value.artists);
                $.each(item.artists, (ii, artist) => {
                    if(artist.name === itemRequest[1]){
                        console.log("artist", artist.name);
                        console.log("track", item.artists);

                        url = item.external_urls.spotify;
                        s = url.substring(31, 53);
                        playerResult = s;
                    }
                })
            })
            if(!url || !s){
                console.warn("artist not found");
                return
            }
            console.log("Player: "+playerResult);
            $('#main-card').html("<iframe src='https://open.spotify.com/embed/track/"+playerResult+"' allow='autoplay' width='300' height='380' frameborder='0' allowtransparency='true' allow='encrypted-media'></iframe>")
            shareData.url = "https://open.spotify.com/track/"+playerResult;
            $('#social').show();
            bindListeners(playerResult);
        }
    });
}
else {
    $.ajax({
        url: "https://api.spotify.com/v1/search?q="+itemRequest[0]+"&type=track&market=US",
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
}

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

var playlistId = "";
var likeButton = $('#like');
function bindListeners(playerResult) {


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
    shareButton.on("click",  (e) => {
        e.preventDefault();
        navigator.share({text: window.location.href, url: window.location.href})
            .then(() => console.log('Successful share'),
                error => console.log('Error sharing:', error));
    });


    // $("button[title='Play']").click();
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

var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition
var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList
var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent

var recognizing;
var recognition = new webkitSpeechRecognition();
recognition.continuous = true;
reset();
recognition.onspeechend = function() {
    recognition.stop();
    console.log('Speech recognition has stopped.');
    reset();
}
recognition.onresult = function (event) {
    console.log('recording successfully ' + event);

    for (var i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
            item = event.results[i][0].transcript;
            console.log(item);
            if(item.includes('like')){
                console.log(item);
                likeButton.click();
            }
            if(item.includes('playlist')){
                $('.dropdown-menu').addClass('show');
            }
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
}

function reset() {
    recognizing = false;
}
function toggleStartStop() {
    console.log("recording");
    recognition.start();
    recognizing = true;
    //}
}


//https://open.spotify.com/track/
