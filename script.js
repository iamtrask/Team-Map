// Initializes map:
mapboxgl.accessToken = 'pk.eyJ1IjoiNG1iZXIiLCJhIjoiY2o2NnQ0cTl4MmdwcDM0bndlbHJhYTFncCJ9.GahchQU-fM2Yemdup7m0tQ';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/4mber/cj69sle4h2nzn2sl82plyqb50',
    center: [-35.972,27.415],
    zoom: 1.5
});

// Loads layers source:
map.on('load', function() {
    map.addSource('source-contribute', {
        type: 'vector',
        url: 'mapbox://4mber.cj7amzm0n0e7d34pna80r51ev-1uklr'
    });
});

// Creates repo buttons to sort layers:
var toggleableLayerIds = ['Adapters', 'Capsule', 'Docs', 'mine.js', 'openmined.org', 'PyAono', 'PyBV', 'PySonar', 'PySyft', 'PyYashe', 'radar.js', 'Sonar', 'syft.js', 'Team-Map', 'Other Contributions'];
var id = '';
var link = '';

for (var i = 0; i < toggleableLayerIds.length; i++) {
    id = toggleableLayerIds[i];
    link = document.createElement('a');
    link.href = '#';
    link.className = 'active';
    link.textContent = id;
    link.onclick = function(e) {
        var clickedLayer = this.textContent;
        var visibility = map.getLayoutProperty(clickedLayer, 'visibility');
        if (visibility === 'visible') {
            map.setLayoutProperty(clickedLayer, 'visibility', 'none');
            this.className = 'inactive';
        } else {
            this.className = 'active';
            map.setLayoutProperty(clickedLayer, 'visibility', 'visible');
        }
    };
    var layers = document.getElementById('menu');
    layers.appendChild(link);
}

// Creates View None button:
var noneLink = document.createElement('a');
noneLink.href = '#';
noneLink.className = 'view-none';
noneLink.textContent = 'View None';
noneLink.onclick = function(e) {
    toggleableLayerIds.forEach(function(id) {
        map.setLayoutProperty(id, 'visibility', 'none');
        if ($('#filter-container a').is(".active")) {
            $('#filter-container a').addClass("inactive");
        }
    });
};
layers.appendChild(noneLink);

// Creates View All button:
var allLink = document.createElement('a');
allLink.href = '#';
allLink.className = 'view-all';
allLink.textContent = 'View All';
allLink.onclick = function(e) {
    toggleableLayerIds.forEach(function(id) {
        map.setLayoutProperty(id, 'visibility', 'visible');
        if ($('#filter-container a').is(".inactive")) {
            $('#filter-container a').removeClass("inactive");
            $('#filter-container a').addClass("active");
        }
    });
};
layers.appendChild(allLink);

// Creates all markers & pop up windows, including all functionality:
map.on('click', function(e) {
    var features = map.queryRenderedFeatures(e.point, {
        layers: ['Other Contributions', 'Adapters', 'Capsule', 'Docs', 'PySonar', 'PySyft', 'PyYashe', 'Sonar', 'Team-Map', 'mine.js', 'openmined.org', 'syft.js', 'PyBV', 'PyAono', 'radar.js']
    });
    if (!features.length) {
        return;
    }
    var feature = features[0];

    // Looks for social media links and adds icons only if they're available:
    var myHTML = '<h1>' + feature.properties.Name + ' ' + feature.properties.Surname + '</h1><h3 class="location">';
    myHTML += feature.properties.Location + '</h3><h4 id="time"></h4><div class="social-container">';
    if (feature.properties.SlackID.length != 0) {
        myHTML += '<a href="slack://user?team=T6963A864&id=@' + feature.properties.SlackID + '"><img id="slack" src="icons/slack.svg" alt="Slack" class="social-icon"></a>';
    }
    if (feature.properties.Twitter.length != 0) {
        myHTML += '<a href="https://twitter.com/' + feature.properties.Twitter + '" target="_blank"><img id="twitter" src="icons/twitter.svg" alt="Twitter" class="social-icon"></a>';
    }
    if (feature.properties.GitHub.length != 0) {
        myHTML += '<a href="https://github.com/' + feature.properties.GitHub + '" target="_blank"><img id="github" src="icons/github.svg" alt="GitHub" class="social-icon"></a>';
    }
    if (feature.properties.Email.length != 0) {
        myHTML += '<a href="mailto:' + feature.properties.Email + '"><img id="email" src="icons/mail.svg" alt="Email" class="social-icon"></a>';
    }
    myHTML += '</div><p>' +
        feature.properties.About + '</p><div class="domain-expertise"><h2>Domain Expertise:</h2><p>' +
        feature.properties.DomainExpertise + '</p></div><div class="languages-frameworks"><h2>Languages/ Frameworks:</h2><p>' +
        feature.properties.LanguagesFrameworks + '</p></div><div class="familiarities"><h2>Familiarities:</h2><p>' +
        feature.properties.Familiarities + '</p></div><div id="repo-contributes"></div>';
    if (feature.properties.WebsiteURL.length != 0) {
        myHTML += '<a href="' + feature.properties.WebsiteURL + '" target="_blank"><div id="website" class="website-contain"><span class="website">MY WEBSITE</span></div></a>';
    }
    var popup = new mapboxgl.Popup({
            offset: [0, -15]
        })
        .setLngLat(feature.geometry.coordinates)
        .setHTML(myHTML)
        .setLngLat(feature.geometry.coordinates)
        .addTo(map);

    // Calculates and adds local time to each popup:
    var loc = feature.properties.LatPrint + ',' + feature.properties.LngPrint; // Location expressed as lat,lng tuple
    var targetDate = new Date(); // Current date/time of user computer
    var timestamp = targetDate.getTime() / 1000 + targetDate.getTimezoneOffset() * 60; // Current UTC date/time expressed as seconds since midnight, January 1, 1970 UTC
    var apikey = 'AIzaSyAkthwn8BINkq9EoU-mrsyXVSwHcho6E_M';
    var apicall = 'https://maps.googleapis.com/maps/api/timezone/json?location=' + loc + '&timestamp=' + timestamp + '&key=' + apikey;
    var xhr = new XMLHttpRequest(); // create new XMLHttpRequest2 object
    xhr.open('GET', apicall); // open GET request
    xhr.onload = function() {
        if (xhr.status === 200) { // if Ajax request successful
            var output = JSON.parse(xhr.responseText); // convert returned JSON string to JSON object
            if (output.status == 'OK') { // if API reports everything was returned successfully
                var offsets = output.dstOffset * 1000 + output.rawOffset * 1000; // get DST and time zone offsets in milliseconds
                var localdate = new Date(timestamp * 1000 + offsets); // Date object containing current time of Location (timestamp + dstOffset + rawOffset)
                document.getElementById('time').innerHTML = 'Local Time:  ' + localdate.toLocaleString();
            } else {
                alert('Request failed.  Returned status of ' + xhr.status);
            }
        }
    };
    xhr.send(); // send request

    // Finds GitHub repos each person has contributed to and adds to popup:
    if (feature.properties.GitHub.length != 0) {
        var githubID = feature.properties.GitHub;
        var contributions = [];
        var repos = ['PySyft', 'PySonar', 'PyAono', 'Capsule', 'openmined.org', 'Docs', 'Sonar', 'Adapters', 'mine.js', 'PyYashe', 'syft.js', 'Team-Map', 'PyBV', 'radar.js'];
        repos.forEach(function(repo) {
            var githubcall = 'https://api.github.com/repos/OpenMined/' + repo + '/contributors?client_id=ac576b085ce24d8ce500&client_secret=00110f8b95ee6bac4abd27a36d58d804695a2a19';
            var git = new XMLHttpRequest();
            git.open('GET', githubcall); // open Get request
            git.onload = function() {
                if (git.status === 200) { // if Ajax request successful
                    var output = JSON.parse(git.responseText); // convert returned JSON string to JSON object
                    console.log(output); // log output for debugging purposes
                    function _isContains(json, value) {
                        let contains = false;
                        Object.keys(json).some(key => {
                            contains = typeof json[key] === 'object' ? _isContains(json[key], value) : json[key] === value;
                            return contains;
                        });
                        return contains;
                    }
                    if (_isContains(output, githubID) === true) {
                        contributions.push(' ' + repo);
                        document.getElementById('repo-contributes').innerHTML = '<h2>GitHub Contributions: </h2><p>' + contributions + '</p>';
                    }
                }
            };
            git.send(); // send request
        });
    };
});
