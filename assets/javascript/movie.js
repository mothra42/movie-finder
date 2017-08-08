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


//an array that stores movie properties like genre, director etc. 
var infoArray = [];
//poster is an array that stores poster url's
var posterArray = [];
var posterInTheatresArray = [];
var infoInTheatresArray = [];

var isexist = false;
var zipcode;
var username;
var userkey;


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
	var username = capitalize($("#username").val().trim());
	console.log(username);
	var zipcode = $("#zip-code").val().trim();
	localStorage.zipcode = zipcode;
	localStorage.username = username;

	database.ref().once("value", function(snap) {
		var snappy = snap.val();
		var keys = Object.keys(snappy);
		var counter = 0;
		for (i = 0; i < keys.length; i++) {
			console.log(snappy[keys[i]]);
			console.log(keys[i]);
			if (snappy[keys[i]].name === username) {
				localStorage.userkey = keys[i];
				userkey = keys[i];
				isexist = true;
				counter++;
				$("#signInModal").modal("hide");
				break;
			}
		}

		if (counter === 0 && isexist === false) {
			database.ref().push({
				name: username,
				zipcode: zipcode
			})
			database.ref().once("child_added", function(snap) {
				if (username === snap.val().name) {
					localStorage.userkey = snap.key;
					userkey = snap.key;
				}
			})
			isexist = true;
			$("#signInModal").modal("hide");
		}
	})
}

function logout() {
	localStorage.removeItem("userkey", "username", "zipcode");
	location.reload();
}


function keyword(event) 
{
	event.preventDefault();
	var keyword = $("#user-keyword-input").val().trim();
	//console.log(keyword);
	var queryURL = "http://www.omdbapi.com/?s=" + keyword + "&y=&plot=short&apikey=40e9cece";

	$.ajax({
		url: queryURL,
		method: "GET"
	}).done(function(response)
	{
		var movies = response.Search;
		secondAjax(movies,0);
	});	
}

function secondAjax(movies,i,poster,info)
{
	if(i === movies.length)
	{
		displayPosters(posterArray,infoArray);
		return;
	}

	var title = movies[i].Title;
	$.ajax({
		url: "http://www.omdbapi.com/?t=" + title + "&y=&plot=short&apikey=40e9cece",
		method: "GET"
	}).done(function(response)
	{
		var subarray= [];
		subarray.push(response.Genre, response.Director, response.Rated, response.imdbRating);
		posterArray.push(response.Poster);
		infoArray.push(subarray);
		secondAjax(movies,++i,posterArray,infoArray);
	});
}

function secondAjax2(movies,i,poster = []) {

	//event.preventDefault();
	console.log(i, movies.length);

	if(i === movies.length)
	{
		displayPosters(posterInTheatresArray, infoInTheatresArray);
		return;
	}

	var title = movies[i];
	//console.log("title ", title);

	$.ajax({
		url: "http://www.omdbapi.com/?t=" + title + "&y=&plot=short&apikey=40e9cece",
		method: "GET"
	}).done(function(response)
	{
		posterInTheatresArray.push(response.Poster);
		console.log("posterInTheatresArray ", posterInTheatresArray);
		getInTheatresPosters(movies,++i,posterInTheatresArray);
	});
}

// grab movies around 5 miles of user's zipcode
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
	}).done()
}

function dataHandler(data) {
	var movies = data.hits;
	var title = [];
	var rating = [];
	var genre = [];
	var description = [];
	var director = [];
	var topcast = [];
	var showtime = [];
	var theatreid = [];
	var theatre = [];

	$.each(data, function(index, movie) {
		console.log(movie);
		title.push(movie.title);

		if (movie.ratings) {
			rating.push(movie.ratings[0].code);
		}
		else if (!movie.ratings) {
			rating.push("N/A");
		}

		var temp1 = "";
		if (movie.genres !== undefined) {
			for (i = 0; i < movie.genres.length; i++) {
				temp1 += movie.genres[i] + ", ";
				if (i === movie.genres.length - 1) {
					temp1 += movie.genres[i];
				}
			}
			genre.push(temp1);
		}
		else {
			genre.push("undefined");
			}
		

		description.push(movie.shortDescription);

		if (movie.directors !== undefined) {
			director.push(movie.directors[0]);
		}
		else {
			director.push("undefined");
		}

		var temp2 = "";
		if (movie.topCast !== undefined) {
			for (j = 0; j < movie.topCast.length; j++) {
				temp2 += movie.topCast[j] + ", ";
				if (j === movie.topCast.length - 1) {
					temp2 += movie.topCast[j];
				}
			}
			topcast.push(temp2);

		}
		else {
			topcast.push("undefined");
		}

		temp3 = "";
		temp4 = "";
		temp5 = "";
		if (movie.showtimes !== undefined) {
			for (i = 0; i < movie.showtimes.length; i++) {
				temp3 += movie.showtimes[i].dateTime + ", ";
				temp4 += movie.showtimes[i].theatre.id + ", "
				temp5 += movie.showtimes[i].theatre.name + ", "
				if (i === movie.showtimes.length - 1) {
					temp3 += movie.showtimes[i];
					temp4 += movie.showtimes[i].theatre.id;
					temp5 += movie.showtimes[i].theatre.name
				}
			}
			showtime.push(temp3);
			theatreid.push(temp4);
			theatre.push(temp5);
		}
	});
	var array = [title, rating, genre, description, director, topcast, showtime, theatreid, theatre];
	
	if (data.length === title.length)
	{
		secondAjax2(title,0)
		//getInTheatresPosters(title,0);
		//displayRecData(api2array);
	}
}


// display posters on main page
// send voteup/votedown information to ??? function
function displayPosters(poster, info) 
{ 
	//test object
	//compatObject = {
	//	action: -1,
	//	sci_fi: 0,
	//	george_lucas: 0,
	//	jj_abrams: 0
	//};

	var newPoster = filter(poster, info);

	//instructions and submit button
	$("#instructions").show();

	$("#poster").empty();

	var rows = 0;
	var flag = false;

	// loop through and dynamically place posters
	for (var poster_row = 0, i = 0; i < newPoster.length; i++, poster_row++) 
	{
		
		// every 4 posters are placed in one row
		if (rows === poster_row)
		{ 
			var moviePoster = $("<div>").attr("class", "row poster-row");
			//moviePoster.prepend($("<div>").attr("class", "row"));
			rows += 4;	
		}

		// if img src isn't empty, show on main page
		if (newPoster[i] !== "N/A")
		{
			// if img src doesn't match a previously loaded img src - to avoid dupes
			for (var j = 0; j < i; j++)
			{
				if (newPoster[i] === newPoster[j])
				{
					flag = true;
					poster_row--;
    			
    			}
    		}
    		// no dupes found
    		if (flag === false)
    		{
    			moviePoster.append($("<div id=\"poster"+i+"\" class=\"col-md-2 moviePoster\" value="+i+"><img src="+newPoster[i]+"><i class=\"fa fa-thumbs-o-up fa-lg goodMovie\" aria-hidden=\"true\" value="+i+"></i><i class=\"fa fa-thumbs-o-down fa-lg badMovie\" aria-hidden=\"true\" value="+i+"></i></div>"));

    			$("#poster").append(moviePoster);

    		}
    		flag = false;
    	}
    	
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

		$("#poster"+poster_array_value).remove();

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

		$("#poster"+poster_array_value).remove();
	});
}

//main 
 //this will determine if this is a first time or returning user
$(document).ready(function() {
	database.ref().on("value", function(snap) {
		var checker = snap.val();
		userkey = localStorage.userkey;
		if (checker === null) {
			isexist = false;
			$("#signInModal").modal('show');
		}
		else if (checker !== null) {
			if (userkey !== undefined) {
				database.ref("/" + localStorage.userkey).once("value", function(snap) {
					var name = snap.val().name;
					console.log(name);
					if (name === localStorage.username) {
						isexist = true;
						zipcode = snap.val().zipcode;
						username = snap.val().name;
						$("#signInModal").modal('hide');
					}
					else {
						isexist = false;
						$("#signInModal").modal('show');
					}
				})
			}
			else {
				$("#signInModal").modal('show');
			}
		}
	})
	//instructions and submit button
	$("#instructions").hide();
})

$("#signin").click(signin);

$("#user-keyword-btn").click(keyword);

$("#movies-near-user-btn").click(zip);