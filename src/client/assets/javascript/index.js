// PROVIDED CODE BELOW (LINES 1 - 80) DO NOT REMOVE

// The store will hold all information needed globally
var store = {
	track_id: undefined,
	player_id: undefined,
	race_id: undefined,
}

var tracks = {
	1: { name: 'Desert Stone', bg: 'track1-bg' },
	2: { name: 'Dirt Road', bg: 'track2-bg' },
	3: { name: 'Rocky Road', bg: 'track3-bg' },
	4: { name: 'Ice', bg: 'track4-bg' },
	5: { name: 'Lava', bg: 'track5-bg' },
	6: { name: 'Asteroids', bg: 'track6-bg' },
}

var racers = {
	1: { name: '', bg: 'racer1-bg' },
	2: { name: '', bg: 'racer2-bg' },
	3: { name: '', bg: 'racer3-bg' },
	4: { name: '', bg: 'racer4-bg' },
	5: { name: '', bg: 'racer5-bg' },
	6: { name: '', bg: 'racer6-bg' },
}

// We need our javascript to wait until the DOM is loaded
document.addEventListener("DOMContentLoaded", function() {
	onPageLoad()
	setupClickHandlers()
})

async function onPageLoad() {
	try {
		getTracks()
			.then(tracks => {
				const html = renderTrackCards(tracks)
				renderAt('#tracks', html)
			})

		getRacers()
			.then((racers) => {
				const html = renderRacerCars(racers)
				renderAt('#racers', html)
			})
	} catch(error) {
		console.log("Problem getting tracks and racers ::", error.message)
		console.error(error)
	}
}

function setupClickHandlers() {
	document.addEventListener('click', function(event) {
		const { target } = event

		// Race track form field
		if (target.matches('.card.track')) {
			handleSelectTrack(target)
		}

		// Podracer form field
		if (target.matches('.card.podracer')) {
			handleSelectPodRacer(target)
		}

		// Submit create race form
		if (target.matches('#submit-create-race')) {
			event.preventDefault()

			// start race
			handleCreateRace()
		}

		// Handle acceleration click
		if (target.matches('#gas-peddle')) {
			handleAccelerate()
		}

	}, false)

	// Handle acceleration press
	window.addEventListener('keydown', function(e) {
		if(e.code == 'Space' && e.target == document.body) {
			e.preventDefault();
			if (store.race_id !== undefined) {
				handleAccelerate()
			}
		}
	});
}

async function delay(ms) {
	try {
		return await new Promise(resolve => setTimeout(resolve, ms));
	} catch(error) {
		console.log("an error shouldn't be possible here")
		console.log(error)
	}
}
// ^ PROVIDED CODE ^ DO NOT REMOVE

// This async function controls the flow of the race, add the logic and error handling
async function handleCreateRace() {
	// render starting UI
	// render starting UI
	if(!store.track_id || !store.player_id) {
	  alert(`Select a track and racer`);
	  return;
	}

	// Get player_id and track_id from the store
	const { player_id, track_id } = store

	try {
		// invoke the API call to create the race, then save the result
		const race = await createRace(player_id, track_id)
		// update the store with the race id
		store.race_id = parseInt(race.ID) - 1
		renderAt('#race', renderRaceStartView(race.Track, race.Cars))
		// The race has been created, now start the countdown
		// call the async function runCountdown
		await runCountdown()
		// call the async function startRace
		await startRace(store.race_id)
		// call the async function runRace
		await runRace(store.race_id)
	} catch(e) {
  	console.error(e);
  }
}

function runRace(raceID) {
	return new Promise(resolve => {
		// use Javascript's built in setInterval method to get race info every 500ms
		const raceInterval = setInterval(async () => {
			const res = await getRace(raceID)
			switch (res.status) {
				case 'finished':
					clearInterval(raceInterval) // to stop the interval from repeating
					renderAt('#race', resultsView(res.positions)) // to render the results view
					document.getElementById('raceTracks').style.display = "none"
					resolve(res) // resolve the promise

					// reset the race
					store.race_id = undefined

					break;

				default:
					renderAt('#leaderBoard', raceProgress(res.positions))
					break;
			}
	}, 500)
	}).catch(err => console.error(`Problem with runRace(${raceID}) promise::`,err))
}

async function runCountdown() {
	try {
		// wait for the DOM to load
		await delay(1000)
		let timer = 3

		return new Promise(resolve => {
			const updateCounter = () => {
				--timer
				// if the countdown is done, clear the interval, resolve the promise, and return
				if (timer === 0) {
					resolve(clearInterval(interval))
				}
				// run this DOM manipulation to decrement the countdown for the user
				document.getElementById('big-numbers').innerHTML = timer
			}
			// use Javascript's built in setInterval method to count down once per second
			const interval = setInterval(updateCounter,1000)

		})
	} catch(error) {
		console.log(error);
	}
}

function handleSelectPodRacer(target) {
	console.log("selected a pod", target.id)

	// remove class selected from all racer options
	const selected = document.querySelector('#racers .selected')
	if(selected) {
		selected.classList.remove('selected')
	}

	// add class selected to current target
	target.classList.add('selected')

	// save the selected racer to the store
	store.player_id = parseInt(target.id)
}

function handleSelectTrack(target) {
	console.log("selected a track", target.id)

	// remove class selected from all track options
	const selected = document.querySelector('#tracks .selected')
	if(selected) {
		selected.classList.remove('selected')
	}

	// add class selected to current target
	target.classList.add('selected')

	// save the selected track id to the store
	store.track_id = parseInt(target.id)

}

async function handleAccelerate() {
	// Invoke the API call to accelerate
	try {
		await accelerate(store.race_id)
	} catch(err) {
		console.error(`Problem with handleAccelerate function::`, err)
	}
}

// HTML VIEWS ------------------------------------------------
// Provided code - do not remove

function renderRacerCars(racers) {
	if (!racers.length) {
		return `
			<h4>Loading Racers...</4>
		`
	}

	const results = racers.map(renderRacerCard).join('')

	return results
}

function renderRacerCard(racer) {
	const { id, driver_name, top_speed, acceleration, handling } = racer

	return `
		<li class="card podracer ${racers[id].bg}" id="${id}">
			<div>
				<h3>${driver_name}</h3>
				<dl>
					<dt>Top Speed</dt>
					<dd>${top_speed}</dd>
					<dt>Acceleration</dt>
					<dd>${acceleration}</dd>
					<dt>Handling</dt>
					<dd>${handling}</dd>
				</dl>
			</div>
		</li>
	`
}

function renderTrackCards(tracks) {
	if (!tracks.length) {
		return `
			<h4>Loading Tracks...</4>
		`
	}

	const results = tracks.map(renderTrackCard).join('')

	return results
}

function renderTrackCard(track) {
	const { id } = track

	return `
		<li id="${id}" class="card track ${tracks[id].bg}">
			${tracks[id].name}
		</li>
	`
}

function renderCountdown(count) {
	return `
		<h2>Race Starts In...</h2>
		<p id="big-numbers">${count}</p>
	`
}

function renderRaceStartView(track, racers) {
	return `
		<header>
			<h1>Race: ${track.name}</h1>
		</header>
		<main id="two-columns">
			<section id="leaderBoard">
				${renderCountdown(3)}
			</section>

			<section id="accelerate">
				<h2>Directions</h2>
				<p>Click the button, or press <strong>spacebar</strong>, as fast as you can to make your racer go faster!</p>
				<button id="gas-peddle">Click Me To Win!</button>
			</section>
		</main>
		<footer></footer>
	`
}

function resultsView(positions) {
	positions.sort((a, b) => (a.final_position > b.final_position) ? 1 : -1)

	return `
		<header>
			<h1>Race Results</h1>
		</header>
		<main>
			<section id="create-race">
				${raceProgress(positions)}
				<a class="button" href="/race">Start a new race</a>
			</section>
		</main>
		<footer></footer>
	`
}

function raceProgress(positions) {
	let userPlayer = positions.find(e => e.id === store.player_id)
	userPlayer.driver_name += " (you)"

	positions = positions.sort((a, b) => (a.segment > b.segment) ? -1 : 1)
	let count = 1

	const results = positions.map(p => {
		return `
			<h3>${count++} - ${p.driver_name}</h3>
		`
	}).join('')

	const positionPerc = positions
		.sort((a, b) => (a.id > b.id) ? -1 : 1)
		.map(p => {
			let completion = p.segment/201
			completionPercent = Math.round(completion*100)
			let pos = `bottom:${completionPercent}%`
			return `
				<span class="trackPos ${tracks[store.track_id].bg}" style="--racer-name: '${p.driver_name}'">
					<span class="raceCar ${racers[p.id].bg}" style="${pos};"></span>
				</span>
			`
		}).join('')

	return `
		<main>
			<h3>Leaderboard</h3>
			<section id="leaderBoard">
				${results}
			</section>
			<section id="raceTracks">
				${positionPerc}
			</section>
		</main>
	`
}

function renderAt(element, html) {
	const node = document.querySelector(element)

	node.innerHTML = html
}

// ^ Provided code ^ do not remove


// API CALLS ------------------------------------------------

const SERVER = 'http://localhost:8000'

function defaultFetchOpts() {
	return {
		mode: 'cors',
		headers: {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin' : SERVER,
		},
	}
}

// Make a fetch call (with error handling!) to each of the following API endpoints

function getTracks() {
	// GET request to `${SERVER}/api/tracks`
	return fetch(`${SERVER}/api/tracks`)
				 .then( response => response.json() )
				 .catch( error => console.log("Problem with getTracks request::", error) )
}

function getRacers() {
	// GET request to `${SERVER}/api/cars`
	return fetch(`${SERVER}/api/cars`)
				 .then( response => response.json() )
				 .catch( error => console.log("Problem with getRacers request::", error) )
}

function createRace(player_id, track_id) {
	player_id = parseInt(player_id)
	track_id = parseInt(track_id)
	const body = { player_id, track_id }

	return fetch(`${SERVER}/api/races`, {
		method: 'POST',
		...defaultFetchOpts(),
		dataType: 'jsonp',
		body: JSON.stringify(body)
	})
	.then(res => res.json())
	.catch(err => console.log(`Problem with createRace(${player_id}, ${track_id}) request::`, err))
}

function getRace(id) {
	// GET request to `${SERVER}/api/races/${id}`
	return fetch(`${SERVER}/api/races/${id}`,{
		...defaultFetchOpts(),
	})
	.then(response => response.json())
	.catch(err => console.error(`Problem with getRace(${id}) request::`, err))
}

function startRace(id) {
	return fetch(`${SERVER}/api/races/${id}/start`, {
		method: 'POST',
		...defaultFetchOpts(),
	})
	.catch(err => console.log(`Problem with startRace(${id}) request::`, err))
}

function accelerate(id) {
	// POST request to `${SERVER}/api/races/${id}/accelerate`
	// options parameter provided as defaultFetchOpts
	// no body or datatype needed for this request
	return fetch(`${SERVER}/api/races/${id}/accelerate`, {
		method: 'POST',
		...defaultFetchOpts(),
	})
	.catch(err => console.error(`Problem with accelerate(${id}) request::`, err))
}
