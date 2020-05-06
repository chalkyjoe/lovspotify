var imgUrl = '';
var changeTrack = 1;
window.onload = function () {
    refresh_content();
    GetWeather();
    setInterval(function () {
        refresh_content();
    }, 1100);
    setInterval(function () {
        GetWeather();
    }, 1800000);
};

document.onkeydown = checkKey;

let touchstartX = 0;
let touchstartY = 0;
let touchendX = 0;
let touchendY = 0;
var isPaused = true;

const gestureZone = document;

gestureZone.addEventListener('touchstart', function(event) {
    touchstartX = event.changedTouches[0].screenX;
    touchstartY = event.changedTouches[0].screenY;
}, false);

gestureZone.addEventListener('touchend', function(event) {
    touchendX = event.changedTouches[0].screenX;
    touchendY = event.changedTouches[0].screenY;
    handleGesture();
}, false); 

function handleGesture() {
    if (touchendX < touchstartX) {
        song_forward();
    }
    
    if (touchendX > touchstartX) {
        song_backward();
    }
    if (touchendY === touchstartY) {
        if (isPaused)
        {
            song_play();
        } else {
            song_pause();
        }        
    }
}

function checkKey(e) {

    e = e || window.event;

    if (e.keyCode == '38') {
        // up arrow
        song_volumeup()
    }
    else if (e.keyCode == '40') {
        // down arrow
        song_volumedown()
    }
    else if (e.keyCode == '37') {
        // left arrow
        song_backward()
    }
    else if (e.keyCode == '39') {
        // right arrow
        song_forward()
    }

}

async function postData(url = '', data = {}) {
    // Default options are marked with *
    const response = await fetch( url, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json',
        }
    });
    console.log("RESPONSE: " + response.status);
    if (response.status === 200) {
        return await response.json(); // parses JSON response into native JavaScript objects
    } else {
        return null;
    }
}

async function getData(url = '', data = {}) {
    if (url.startsWith('http') == false) 
    {
	url = 'http://localhost:8080/' + url;
    }
    // Default options are marked with *
    const response = await fetch( url, {
        method: 'GET', // *GET, POST, PUT, DELETE, etc.
        cache: 'default', // *default, no-cache, reload, force-cache, only-if-cached
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json',
        }
    }).catch(error => {
        console.error(error)
    });

    console.log("RESPONSE: " + response);
    if(response === undefined) return response;
    if (response.status === 200) {
        return await response.json(); // parses JSON response into native JavaScript objects
    } else {
        return undefined;
    }
}

function refresh_content() {
    getData("player/current", "").then(result => {
        if (result === undefined) {
            document.getElementById("spotify-image").src = "images/placeholder_1.png";
            document.getElementById("spotify-artist").innerText = "Not Connected";
            document.getElementById("spotify-title").innerText = "Not Connected";
            document.getElementById("spotify-album").innerText = "Not Connected";
            document.getElementById("spotify-time").innerText = "Not Connected";
            document.getElementById("spotify-not-connected").hidden = false;
            document.getElementById("time").innerText = moment().format('HH:mm');
            document.getElementById("date").innerHTML = moment().format('dddd<br /> Do MMMM');
        } else {
            document.getElementById("spotify-artist").innerText = result.track.artist[0].name;
            document.getElementById("spotify-title").innerText = result.track.name;
            document.getElementById("spotify-album").innerText = result.track.album.name;
            document.getElementById("spotify-time").innerText = GetTime(result.trackTime, result.track.duration);
            document.getElementById("spotify-not-connected").hidden = true;
            var percent = (result.trackTime / result.track.duration) * 100;
            document.getElementById("percent").style.width = percent + "%";
            document.getElementById("smalltime").innerText = moment().format('HH:mm');
            document.getElementById("smalldate").innerHTML = moment().format('ddd DD/MM/YYYY');
            var newImgUrl = "https://i.scdn.co/image/" + result.image.key;
            if (imgUrl != newImgUrl || changeTrack != 0)
            {
                console.log(changeTrack);
                var tempChangeTrack = changeTrack;
                $('#spotify-image').animate({'background-position-x': tempChangeTrack != -1 ? '-300px' : '300px'}, function() {
                    imgUrl = newImgUrl;
                    $('<img/>').attr('src', imgUrl).on('load', function() {
                       $(this).remove(); // prevent memory leaks as @benweet suggested
                       $('#spotify-image').css('background-image', `url(${imgUrl})`);
                       $('#spotify-image').css('background-position-x', tempChangeTrack != -1 ? '300px' : '-300px');
                       $('#spotify-image').animate({'background-position-x': '0'});
                    });
                });
                this.changeTrack = 0;
            }
        }
    }).catch(error => {
        console.error(error)
    });
}

function song_play() {
    $("#play_pause_image").removeClass("fa-play").addClass("fa-pause");
    getData("player/resume", "");
    isPaused = false;
}

function song_pause() {
    $("#play_pause_image").removeClass("fa-pause").addClass("fa-play");
    getData("player/pause", "");
    isPaused = true;
}

function song_forward() {
    getData("player/next", "");
    changeTrack = 1;
}

function song_backward() {
    getData("player/previous", "");
    changeTrack = -1;
}

function song_volumeup() {
    getData("player/volume/up", "");
}

function song_volumedown() {
    getData("player/volume/down", "");
}
function GetTime(time, duration) {
    return time.toHHMMSS() + "/" + duration.toHHMMSS();
}

function GetWeather() {
    var weather = document.getElementById("smallweather");
    if (weather != null)
    {
        var url = 'https://cors-anywhere.herokuapp.com/https://api.openweathermap.org/data/2.5/weather?q=manchester,uk&appid=de5a8ebb36ec50432e14d40dcbd82f69&units=metric';
        getData(url).then(result => {
            var weather = `<img src='http://openweathermap.org/img/wn/${result.weather[0].icon}@2x.png' height="30px" /> ${Math.round(result.main.temp)}C`;   
            document.getElementById("smallweather").innerHTML = weather;    
        });
    }
}

Number.prototype.toHHMMSS = function () {
    var sec_num = parseInt(this, 10) / 1000; // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = Math.floor(sec_num - (hours * 3600) - (minutes * 60));

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    return hours+':'+minutes+':'+ seconds;
}
