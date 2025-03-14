'use strict';

const form = document.querySelector('.search-form');
const btnSearchMovies = document.querySelector('#btn-search');
const genreSearch = document.querySelector('#genreSelect');
const yearSearch = document.querySelector('#yearSelect');
const searchInput = document.querySelector('#search-movie');
const favoritesBtn = document.querySelectorAll('.btn-favorites');
const favoritesContainer = document.querySelector('#favoritesContainer');
const favoritesSection = document.querySelector('#favorites .container');
const favoritesHeading = document.querySelector('#favorites h2');

const apiKey = '1bf83a2a';
let moviesList = [];
let favoritesList = [];

function getMovies(searchQuery, selectedYear, selectedGenre) {
  if (!searchQuery || searchQuery.trim() === '') {
    searchQuery = 'movie';
  }

  let url = `https://www.omdbapi.com/?apikey=${apiKey}&type=movie&page=1&s=${searchQuery}`;
  console.log(url);

  if (selectedYear && selectedYear !== 'All Years') {
    url += `&y=${selectedYear}`;
  }

  fetch(url)
    .then((response) =>
      // if (!response.ok) {
      //   throw new Error(`HTTP error! status: ${response.status}`);
      // }
      response.json()
    )
    .then((data) => {
      console.log(data);
      if (data.Response === 'FALSE') {
        throw new Error(data.Error || 'No movies found');
      }
      const movies = data.Search;
      console.log(movies);

      return Promise.all(
        movies.map((movie) =>
          fetch(
            `https://www.omdbapi.com/?apikey=${apiKey}&i=${movie.imdbID}&plot=full`
          ).then((response) => {
            return response.json();
          })
        )
      );
    })
    .then((moviesData) => {
      moviesList = moviesData.map((movie) => ({
        Title: movie.Title,
        Year: movie.Year,
        Genre: movie.Genre,
        Plot: movie.Plot,
        Poster: movie.Poster,
        Released: movie.Released,
        Actors: movie.Actors,
      }));

      if (selectedGenre && selectedGenre !== 'All Genres') {
        moviesList = moviesList.filter(
          (movie) =>
            movie.Genre &&
            movie.Genre.toLowerCase().includes(selectedGenre.toLowerCase())
        );
      }

      displayMovies(moviesList);
    })
    .catch((error) => {
      console.error('Error:', error);
      alert(error.message);
    });
  searchInput.value = '';
}
function displayMovies(movies) {
  const movieContainer = document.querySelector('#filmsContainer');
  const moviesHeading = document.querySelector('#movies-heading');

  movieContainer.innerHTML = '';

  if (movies.length === 0) {
    movieContainer.innerHTML = alert('No movies found');
    return;
  } else if (movies.length > 0) {
    moviesHeading.style.display = 'block';

    movies.forEach((movie, index) => {
      let movieCard = document.createElement('div');
      movieCard.classList.add('col-md-3', 'col-sm-6', 'col-12', 'mb-5');

      const title = movie.Title.replace(/\s+/g, '-').replace(/[^\w-]/g, '');

      movieCard.innerHTML = `
      <div class="poster-container card d-flex flex-column " style="height:1000px">
        <img src="${movie.Poster}" class="card-img-top" alt="${movie.Title}">
        <div class="card-body d-flex flex-column">
          <p class="mt-1 mx-1 mb-1 text-danger">${movie.Title} (${movie.Year})</p>
           <div class="rating mt-0" id="rating-${title}">
            <span class="star" data-value="1">&#9733;</span>
            <span class="star" data-value="2">&#9733;</span>
            <span class="star" data-value="3">&#9733;</span>
            <span class="star" data-value="4">&#9733;</span>
            <span class="star" data-value="5">&#9733;</span>
        </div>
          <h6 class="mt-3"><span class="fw-bold">Genre</span>: ${
            movie.Genre
          }</h6>
          <h6><span class="fw-bold">Released</span>: ${movie.Released}</h6>
          <h6><span class="fw-bold">Actors</span>: ${movie.Actors}</h6>
          <div class="movie-description">
            <span  class="fw-bold">Description</span>
            <span class="short-plot">${
              movie.Plot
                ? movie.Plot.substring(0, 100)
                : 'No plot summary available'
            }</span>
            <span class="full-plot d-none">${movie.Plot}</span>
            <button class="read-more-btn btn btn-link p-0 m-0 btn-hover-red">Read more</button>
          </div>
         <a class="trailer-link" href="#" onclick="event.preventDefault(); fetchTrailer('${
           movie.Title
         }')">🎥 Watch Trailer</a>
           <button 
             class="btn-favorites" 
             data-index="${index}" 
             data-title="${movie.Title}"
             data-poster="${movie.Poster}"
             data-year="${movie.Year}"
             data-genre="${movie.Genre}"
             data-released="${movie.Released}"
             data-actors="${movie.Actors}"
             data-plot="${movie.Plot}"
             data-rating ="${movie.Rating}"
            >Add to Favorites <i class="bi bi-plus-lg fw-bolder mx-1"></i></button>  
        
        </div>
      </div>
    `;

      // add the rating click event
      const stars = movieCard.querySelectorAll('.star');
      stars.forEach((star) => {
        star.addEventListener('click', function () {
          const rating = this.getAttribute('data-value');
          fillStars(title, rating);
          localStorage.setItem(`rating-${title}`, rating);
        });
      });

      // Load saved ratings
      const savedRating = localStorage.getItem(`rating-${title}`);
      if (savedRating) {
        fillStars(title, savedRating);
      }

      movieContainer.appendChild(movieCard);

      // Add event listener for the "read more"link with jQuery

      const $readMoreBtn = $(movieCard).find('.read-more-btn');
      const $card = $(movieCard).find('.card');
      const $description = $(movieCard).find('.movie-description');
      $readMoreBtn.on('click', () => {
        handleReadMoreBtn($card, $description, $readMoreBtn);
      });
    });
  } else {
    moviesHeading.style.display = 'none';
  }
}

// Function to fill the stars by clicking
function fillStars(movieTitle, rating) {
  const stars = document.querySelectorAll(`#rating-${movieTitle} .star`);
  stars.forEach((star) => {
    if (star.getAttribute('data-value') <= rating) {
      star.classList.add('filled');
    } else {
      star.classList.remove('filled');
    }
  });
}

// function to display a trailer of a movie
function fetchTrailer(title) {
  const apiKey = 'AIzaSyD1VukBtMQ2M7G7sZwsJvAbR0TcywjHNwA';
  const query = encodeURIComponent(`${title} trailer`);
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&maxResults=1&type=video&key=${apiKey}`;

  fetch(url).then((response) => {
    response
      .json()
      .then((data) => {
        if (data.items && data.items.length > 0) {
          const videoId = data.items[0].id.videoId;
          const trailerUrl = `https://www.youtube.com/watch?v=${videoId}`;
          window.open(trailerUrl, 'blank');
        } else {
          console.log('No trailer found');
        }
      })
      .catch((error) => console.log(error));
  });
}

function filteredMovies() {
  const title = searchInput.value.trim();
  console.log(title);
  const selectedYear = yearSearch.value;
  const selectedGenre = genreSearch.value;
  getMovies(title, selectedYear, selectedGenre);
}

btnSearchMovies.addEventListener('click', filteredMovies);
yearSearch.addEventListener('change', filteredMovies);
genreSearch.addEventListener('change', filteredMovies);

form.addEventListener('submit', (e) => {
  e.preventDefault();
  filteredMovies();
});

// Implement the logic to add a movie to the Favorites;

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('btn-favorites')) {
    const index = e.target.dataset.index;
    const selectedMovie = moviesList[index];
    addToFavorites(selectedMovie);
  }
});

function addToFavorites(movie) {
  // check if the movie is already in favorites or not
  let favorites = JSON.parse(localStorage.getItem('favoritesList')) || [];

  if (favorites.some((favo) => favo.Title === movie.Title)) {
    //  if the movie  exists already in the lestr alert and stop the execution
    alert('The movie is already added to your favorites');
    return;
  } else {
    // if the movie is not in favorites push it in the list
    favorites.push(movie);

    localStorage.setItem('favoritesList', JSON.stringify(favorites));

    // create and display the movie card
    const movieCard = createMovieCard(movie);
    favoritesContainer.appendChild(movieCard);

    if (favoritesSection.classList.contains('hidden')) {
      favoritesSection.classList.remove('hidden');
      favoritesHeading.classList.remove('hidden');
    }
    // message that the movie had been added to the favo
    alert(`${movie.Title} has been added to your favorites!`);
  }
}

function handleReadMoreBtn($card, $description, $readMoreBtn) {
  const cardIsExpanded = $card.hasClass('expanded');

  if (cardIsExpanded) {
    // Collapse the card
    $description.find('.short-plot').show();
    $description.find('.full-plot').addClass('d-none');
    $readMoreBtn.text('Read more');
    $card.removeClass('expanded');

    $card.css('height', '1000px');
  } else {
    // Expand the card
    $description.find('.short-plot').hide();
    $description.find('.full-plot').css('font-weight', 'normal');
    $description.find('.full-plot').removeClass('d-none');
    $readMoreBtn.text('Read less');
    $card.addClass('expanded');
    $card.css('height', 'auto');
  }
}

// Create movie card for the favorite section

function createMovieCard(movie) {
  const movieCardFavorites = document.createElement('div');
  movieCardFavorites.classList.add('col-md-3', 'col-sm-6', 'col-12', 'mb-4');

  const title = movie.Title.replace(/\s+/g, '-').replace(/[^\w-]/g, '');

  movieCardFavorites.innerHTML = `
  <div class="poster-container card d-flex flex-column justify-content-between" style="height:900px">
      <img src="${movie.Poster}" class= card-img-top" alt="${movie.Title}">
    <div class="card-body d-flex flex-column">
      <p class="mt-1 mb-1 mx-1 text-danger fs-4">${movie.Title} (${movie.Year})</p>
          <div class="rating mt-0" id="rating-${title}">
            <span class="star" data-value="1">&#9733;</span>
            <span class="star" data-value="2">&#9733;</span>
            <span class="star" data-value="3">&#9733;</span>
            <span class="star" data-value="4">&#9733;</span>
            <span class="star" data-value="5">&#9733;</span>
         </div>
        <h6 class="fs-6"><span class="fw-bold">Genre</span>: ${movie.Genre}</h6>
        <h6><span class="fw-bold">Released</span>: ${movie.Released}</h6>
        <h6><span class="fw-bold">Actors</span>: ${movie.Actors}</h6> 
        <div class="movie-description">
            <span class="fw-bold">Description</span>
            <span class="short-plot" style="font-weight:normal">${movie.Plot
      ? movie.Plot.substring(0, 100)
      : 'No plot summary available'
    }</span>
            <span class="full-plot d-none">${movie.Plot}</span>
            <button class="read-more-btn btn btn-link p-0 mt-2 btn-hover-red">Read more</button>
        </div>
       <button class="delete-btn mt-3 mb-3">Remove Movie <i class="bi bi-x mx-1"></i></button>
   </div>
  </div>
`;
  
  document.querySelector('#favorites').classList.remove('hidden');

  // Implementation for filling the stars by clicking by the favorite list cards
  const stars = movieCardFavorites.querySelectorAll('.star');

  stars.forEach((star) => {
    star.addEventListener('click', function () {
      const rating = this.getAttribute('data-value');

      fillStars(title, rating);
      localStorage.setItem(`rating-${title}`, rating);
    });
  });

  // Add event listener for the "read more"link

  // Sinds i have to use jQuery at least 3 methds i am doing this here;
  // this is java script vanilla
  // const readMoreBtn = movieCardFavorites.querySelector(".read-more-btn");
  // const card = movieCardFavorites.querySelector(".card");
  // const description = movieCardFavorites.querySelector(".movie-description")

  // this one is jQuery
  const $readMoreBtn = $(movieCardFavorites).find('.read-more-btn');
  const $card = $(movieCardFavorites).find('.card');
  const $description = $(movieCardFavorites).find('.movie-description');

  // Add the event listener to the read more link
  $readMoreBtn.on('click', () => {
    handleReadMoreBtn($card, $description, $readMoreBtn);
  });

  // Implement the logic of removing a favorite movie

  const deleteBtn = movieCardFavorites.querySelector('.delete-btn');
  deleteBtn.addEventListener('click', () => {
   
    const confirmDeleteMovie = prompt("Confirm with 'yes' if you want to remove the movie");

    if (confirmDeleteMovie.toLowerCase().trim() === "yes"){
      removeFavorites(movie, movieCardFavorites);
  } else {
    alert("Movie was not removed!");
  }
 });

  favoritesContainer.appendChild(movieCardFavorites);

  // Show the saved rating directly in the  favorite card
  const savedRating = localStorage.getItem(`rating-${title}`);
  if (savedRating) {
    fillStars(title, savedRating);
  }

  return movieCardFavorites;
}

// Function to load and display favorite movies
function loadFavorites() {
  const favorites = JSON.parse(localStorage.getItem('favoritesList')) || [];

  // Check if there are favorites and toggle the visibility accordingly
  if (favorites.length === 0) {
    favoritesSection.classList.add('hidden');
    favoritesHeading.classList.add('hidden');
  } else {
    favoritesSection.classList.remove('hidden');
    favoritesHeading.classList.remove('hidden');

    // Clear the container before adding new favorite movies
    favoritesContainer.innerHTML = '';

    // Create and append favorite movie cards
    favorites.forEach((movie) => {
      const movieCard = createMovieCard(movie);
      favoritesContainer.appendChild(movieCard);
    });
  }
}

// Call loadFavorites on page load to handle the visibility based on favorites
document.addEventListener('DOMContentLoaded', loadFavorites);

// define a function to remove a movie from favorites
function removeFavorites(movie, movieCard) {
  // get favorites from the local storage
  let favorites = JSON.parse(localStorage.getItem('favoritesList')) || [];
  console.log(favorites);

  // Remove the movie from the array
  favorites = favorites.filter((favo) => favo.Title !== movie.Title);

  // Update the local storage
  localStorage.setItem('favoritesList', JSON.stringify(favorites));

  // Remove the card from the page;
  movieCard.remove();

  // If there are no more favorites,hide the favosites section;
  if (favorites.length === 0) {
    favoritesSection.classList.add('hidden');
    favoritesHeading.classList.add('hidden');
    // favoritesContainer.classList.add("hidden")
  }
}
document.addEventListener('DOMContentLoaded', loadFavorites);
