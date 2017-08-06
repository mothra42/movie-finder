// firebase & globals

var config = {
	apiKey: "AIzaSyAuUd9yt7ACd_Joi716u_UxYNLtf9oJMbc",
	authDomain: "movie-finder-adc1a.firebaseapp.com",
	databaseURL: "https://movie-finder-adc1a.firebaseio.com",
	projectId: "movie-finder-adc1a",
	storageBucket: "",
	messagingSenderId: "599211651039"
};
	firebase.initializeApp(config);

var database = firebase.database();
var userkey;
var username;
var zipcode;
var localkeywords;


// functions

// format input
function capitalize(a) {
	var temp = a.split(" ");
	var temp1 = "";
	for (i = 0; i < temp.length; i++) {
		temp1 += temp[i].substring(0, 1).toUpperCase() + temp[i].substring(1, ) + " ";
	}
	var final = temp1.trim();
	return final;
}


// database related
function signin() {
	username = capitalize($("#username").val().trim());
	console.log(username);
	zipcode = $("#zip-code").val().trim();
	console.log(zipcode);
	database.ref().push({
		name: username,
		zipcode: zipcode

	})
	$("#signInModal").modal("hide");
	database.ref().on("child_added", function(snap, prekey) {
		userkey = snap.key;
		localStorage.userkey = userkey;
	})
	console.log(userkey);
}

function keyword(event) {
	event.preventDefault();
	var keyword = $("#user-keyword-input").val().trim();
	console.log(keyword);
	var queryURL = "http://www.omdbapi.com/?s=" + keyword + "&y=&plot=short&apikey=40e9cece";

	$.ajax({
		url: queryURL,
		method: "GET"
	}).done(function(response) {
		var movies = response.Search; 
		var array = [];
		for (var i = 0; i < movies.length; i++) {
			var poster = [];
			//secondary ajax search uses titles from first search to get more info about each movie. 
			$.ajax({
				url: "http://www.omdbapi.com/?t=" + movies[i].Title + "&y=&plot=short&apikey=40e9cece",
				method: "GET"
			}).done(function(response) {
				var subarray = [];
				subarray.push(response.Genre, response.Director, response.Rated, response.imdbRating);
				poster.push(response.Poster);
				array.push(subarray);

				if (movies.length === poster.length){
					displayPosters(poster, array);
				}
			});
		}

	console.log(array);
	console.log(poster);
	var result = [array, poster];

	return result;
	})
}

function zip() {
	var apikey = "ac9ryrxhdhyueujdqgayzn4f";
	var baseUrl = "http://data.tmsapi.com/v1.1";
	var showtimesUrl = baseUrl + '/movies/showings';
	var zipCode = zipcode;
	var d = new Date();
	var today = d.getFullYear() + '-' + (d.getMonth()+1) + '-' + d.getDate();
	$.ajax({
		url: showtimesUrl,
		data: { startDate: today,
		zip: zipCode,
		jsonp: "dataHandler",
		api_key: apikey
		},
		dataType: "jsonp",
	})
}

function dataHandler(data) {
	var movies = data.hits;
	var title = [];
	$.each(data, function(index, movie) {
    	var movietitle = movie.title;
		if (movie.ratings) {
			movietitle += ", Rating: "+ movie.ratings[0].code;
		}
	title.push(movietitle);
	});
	console.log(title);
  }


// display posters on main page
// send voteup/votedown information to ??? function
function displayPosters(posterArray, movieInfo) { 

	// move search bar up
	$("#initial-page").css("margin-top", "25px");

	//instructions and submit button
	$("#instructions").show();
	$("#submitPreferences").show();

	$("#poster").empty();

	var rows = 0;

	// loop through and dynamically place posters
	for (var i = 0; i < posterArray.length; i++) {


		// every 4 posters are placed in one row
		if (rows === i){ 

			var moviePoster = $("<div>").attr("class", "row poster-row");
			//moviePoster.prepend($("<div>").attr("class", "row"));
			rows += 4;	
		}

    	moviePoster.append($("<div id=\"poster"+i+"\" class=\"col-lg-2\" value="+i+"><img class=\"img-responsive\" src="+posterArray[i]+"><i class=\"fa fa-thumbs-o-up fa-lg goodMovie\" aria-hidden=\"true\" value="+i+"></i><i class=\"fa fa-thumbs-o-down fa-lg badMovie\" aria-hidden=\"true\" value="+i+"></i></div>"));
    	moviePoster.append($("<div>").attr("class", "col-lg-1"));
    	$("#poster").append(moviePoster);

	}
	//$("#user-keyword-btn").click(keyword);
	$(".goodMovie").on("click", function() {

		// get position in the array of poster clicked
		var poster_array_value = $(this).attr("value");

		//console.log("clicked on", $(this).attr("value"));
		//console.log(movieInfo[poster_array_value]);
		var good_movie_formatted = format(movieInfo[poster_array_value]);
		//console.log("good movie ", good_movie_formatted);
		changeScores(good_movie_formatted, "good");

	});
	$(".badMovie").on("click", function() {

		// get position in the array of poster clicked
		var poster_array_value = $(this).attr("value");
		console.log(poster_array_value);

		console.log("clicked on", $(this).attr("value"));
		console.log(movieInfo[poster_array_value]);
		var bad_movie_formatted = format(movieInfo[poster_array_value]);
		//console.log("bad movie ", good_movie_formatted);
		changeScores(bad_movie_formatted, "bad");

	});
}


//main 
// this will determine if this is a first time or returning user
$(document).ready(function() {
	database.ref().on("value", function(snap) {
		var checker = snap.val();
		if (checker === null) {
			isexist = false;
			$("#signInModal").modal('show');
		}
		else if (checker !== null) {
			database.ref().on("child_added", function(snap, prekey) {
				var key = snap.key;
				if (key === localStorage.userkey) {
					isexist = true;
					username = snap.val().name;
					zipcode = snap.val().zipcode;
					$("#signInModal").modal('hide');
					// localkeywords = snap.val().whitelist;
					// var index = Math.floor(Math.random() * localkeywords.length);
					// keyword(localkeywords[index]);
				}
				else {
					isexist = false;
					$("#signInModal").modal('show');
				}
			})
		}
	})
	//instructions and submit button
	$("#instructions").hide();
	$("#submitPreferences").hide();

})

$("#signin").click(signin);

$("#user-keyword-btn").click(keyword);