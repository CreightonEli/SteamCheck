// global variables:
/// login creds
let key = ""
let steamID = ""

/// user variables
let user = ""
let username = "user"
let userStatus = "Unknown"

/// game library variables
let gameCount = 0
let gameLibrary = ""
let gameNames = []
let wishlist = []

/// login elements
const loginPane = document.querySelector(".login-pane")
const welcomeAvatarEl = document.querySelector(".welcome-avatar-el")
const userWelcome = document.querySelector(".user-welcome")
const steamIDEl = document.querySelector("#steamID-el")
const keyEl = document.querySelector("#key-el")
const errorEl = document.querySelector("#error-el")

/// body elements
const pageContainer = document.querySelector(".container")
const usernameEl = document.querySelector(".username-el")
const statusEl = document.querySelector(".status-el")
const gamesEl = document.querySelector("#games-el")

function getPlayerSummaries() {
    steamID = steamIDEl.value
    key = keyEl.value;
    let playerSummaryURL = "http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=" + key + "&steamids=" + steamID
    
    fetch(playerSummaryURL)
        .then(response => response.json())
        .then(data => {
            user = data.response.players[0]
            console.log(user)

            // pull user data to global variables
            username = user.personaname
            switch (user.personastate) {
                case 0: userStatus = 'Offline'; break;
                case 1: userStatus = 'Online'; break;
                case 2: userStatus = 'Busy'; break;
                case 3: userStatus = 'Away'; break;
                case 4: userStatus = 'Snooze'; break;
                case 5: userStatus = 'Looking to trade'; break;
                case 6: userStatus = 'Looking to play'; break;
            }

            // setting user info to login modal
            welcomeAvatarEl.src = user.avatarmedium
            userWelcome.textContent = " " + username
        })
        .catch(error => {});

}

function getOwnedGames() {
    let ownedGamesURL = "http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?format=json&include_appinfo=true&steamid=" + steamID + "&key=" + key
    console.log(wishlist)

    fetch(ownedGamesURL)
        .then(response => response.json())
        .then(data => {
            // log data received
            console.log(data)

            // fill in steam library section
            gameCount = data.response.game_count
            console.log("Total number of games: " + gameCount)
            if (gameCount in window === true) {
                gamesEl.innerHTML = "<h3>No games found :(</h3>"
            }
            else {
                for (let i = 0; i < gameCount; i++) {
                    // get values
                    gameNames[i] = data.response.games[i].name
                    let appID = data.response.games[i].appid
                    let imgIconHash = data.response.games[i].img_icon_url

                    // make image URL
                    let imgURL = "http://media.steampowered.com/steamcommunity/public/images/apps/" + appID + "/" + imgIconHash + ".jpg"

                    // create list item
                    let listItem = document.createElement("li")

                    // assign values to created list item
                    listItem.innerHTML = '<img src="' + imgURL + '"><p>' + gameNames[i] + '</p><div class="icon-border"></div><i class="ph ph-caret-up"></i>'

                    // add current list item to list
                    gamesEl.appendChild(listItem)
                }
            }
        })
        .catch(error => {
            errorEl.style = "opacity: 1; transform: scale(1);"
            errorEl.textContent = ("ERROR: " + error)
        });
    
}

function getWishlist() {
    let wishlistURL = "https://store.steampowered.com/wishlist/profiles/" + steamID + "/wishlistdata"
    fetch(wishlistURL)
        .then(response => response.json())
        .then(data => {
            for (const appID of Object.keys(data)) {
                const item = data[appID]
                wishlist.push(item)
            }
        })
        .catch(error => {});

}

function login() {
    steamID = steamIDEl.value
    key = keyEl.value
    if (key === "" || steamID === "") { // if either input is empty
        errorEl.style = "opacity: 1; transform: scale(1);"
        if (steamID !== "" && key === "") { // 
            errorEl.textContent = ("ERROR: Missing API key")
        }
        else if (steamID === "" && key !== "") {
            errorEl.textContent = ("ERROR: Missing username")
        }
        else if (steamID === "" && key === "") {
            errorEl.textContent = ("ERROR: Missing username and API key")
        }
        else{}
    }
    else {
        // show and hide pageContainer and loginPane respectively
        pageContainer.classList.add("show")
        loginPane.classList.add("hidden")

        // fill in user profile section
        usernameEl.textContent = username // username
        statusEl.textContent = userStatus // user's online status

        // call functions
        getWishlist()
        getOwnedGames()
        console.log(wishlist)
    }    
}

// testing values put into API key text input box
oninput = (event) => {
    getPlayerSummaries()
};