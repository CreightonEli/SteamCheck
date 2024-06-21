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
let steamPrice = '$0.00'

/// login elements
const loginPane = document.querySelector(".login-pane")
const welcomeAvatarEl = document.querySelector(".welcome-avatar-el")
const userWelcome = document.querySelector(".user-welcome")
const steamIDEl = document.querySelector("#steamID-el")
const keyEl = document.querySelector("#key-el")
const errorEl = document.querySelector("#error-el")

/// body elements
const pageContainer = document.querySelector(".container")
const avatarFullEl = document.querySelector(".avatar-full-el")
const usernameEl = document.querySelector(".username-el")
const statusEl = document.querySelector(".status-el")
const wishlistEl = document.querySelector("#wishlist-el")
const gamesEl = document.querySelector("#games-el")

function getPlayerSummaries() {
    steamID = steamIDEl.value
    key = keyEl.value;
    let playerSummaryURL = "http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=" + key + "&steamids=" + steamID
    
    fetch(playerSummaryURL)
        .then(response => response.json())
        .then(data => {
            user = data.response.players[0]

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

async function getSteamPrices(currentAppID) {
    let priceURL = 'https://store.steampowered.com/api/appdetails?appids=' + currentAppID + '&cc=us&filters=price_overview'
  
    try {
        const response = await fetch(priceURL)
        const data = await response.json()

        let priceString = ""

        priceString = data[currentAppID].data.price_overview.final_formatted

        if (data[currentAppID].data.price_overview.initial_formatted != ""){
            priceString += '<span class="initial-price">' + data[currentAppID].data.price_overview.initial_formatted + '</span>'
        }

        return priceString

    } catch (error) {
        return "No Price Data"
    }
}
function getOwnedGames() {
    let ownedGamesURL = "http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?format=json&include_appinfo=true&steamid=" + steamID + "&key=" + key

    fetch(ownedGamesURL)
        .then(response => response.json())
        .then(data => {
            // log data received

            // fill in steam library section
            gameCount = data.response.game_count
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

async function getWishlist() {
    let wishlistURL = "https://store.steampowered.com/wishlist/profiles/" + steamID + "/wishlistdata"
    fetch(wishlistURL)
        .then(response => response.json())
        .then(data => {
            for (const appID of Object.keys(data)) {
                const item = data[appID]
                wishlist.push(item)
            }
            // Sort the array by priority (ascending)
            wishlist.sort((a, b) => a.priority - b.priority);
            
            // Output to page
            for (let i = 0; i < wishlist.length; i++) {
                if (wishlist[i].type === "Game" || wishlist[i].type === "DLC") {
                    // create subheader
                    let subheader = ''
                    let currentAppID = wishlist[i].capsule.split('/apps/')[1].split('/')[0]
                    let steamStoreURL = 'https://store.steampowered.com/app/' + currentAppID

                    // add platform info to subheader
                    if (wishlist[i].win == 1) {// windows
                        subheader += '<i class="ph ph-windows-logo"></i>'
                    }
                    if (wishlist[i].mac == 1) {// mac
                        subheader += '<i class="ph ph-apple-logo"></i>'
                    }
                    if (wishlist[i].linux == 1) {// linux
                        subheader += '<i class="ph ph-linux-logo"></i>'
                    }
                    else {}

                    // add release date string to subheader
                    subheader += ' | ' + wishlist[i].release_string

                    // add rating string to subheader
                    if (wishlist[i].review_desc == "Overwhelmingly Positive" || wishlist[i].review_desc == "Very Positive" || wishlist[i].review_desc == "Mostly Positive" || wishlist[i].review_desc == "Positive") {// Positive descriptions
                        subheader += ' | <span style="color: var(--positive);">' + wishlist[i].review_desc.toUpperCase() + '</span>'
                    }
                    else if (wishlist[i].review_desc == "Mixed") { // Mixed
                        subheader += ' | <span style="color: var(--mixed);">' + wishlist[i].review_desc.toUpperCase() + '</span>'
                    }
                    else if (wishlist[i].review_desc == "No user reviews") { // No reviews
                        subheader += ' | <span style="color: var(--no-reviews);">' + wishlist[i].review_desc.toUpperCase() + '</span>'
                    }
                    else { // Negative
                        subheader += ' | <span style="color: var(--negative);">' + wishlist[i].review_desc.toUpperCase() + '</span>'
                    }

                    // add tags to subheader
                    subheader += '<div class="tag-container">'
                    for (let j = 0; j < 5; j++) {
                        let tagURL = 'https://store.steampowered.com/tags/en/' + wishlist[i].tags[j] + '/'
                        subheader += '<p class="tag"><a href="' + tagURL + '">' + wishlist[i].tags[j] + '</a></p>'
                    }
                    subheader += '</div>'
                    
                    // get price info
                    getSteamPrices(currentAppID)
                        .then(steamPrice => {
                            // create list item
                            let listItem = document.createElement("li")
                            listItem.classList.add("wishlist-item")

                            // assign values to created list item                        
                            let listItemHtml = '<div class="img-container"><img src="' + wishlist[i].capsule + '" class="bg-image"><img src="' + wishlist[i].capsule + '" class="fg-image"><div class="item-header"><h3><a href="' + steamStoreURL + '">' + wishlist[i].name + '</a></h3><div class="subheader"><p>' + subheader + '</p></div></div></div><div class="item-info"><span class="name-el"><a href="' + steamStoreURL + '">' + wishlist[i].name + '</a></span><div class="subheader">' + subheader + '</div><div class="prices-container"><div class="price-card"><a href="' + steamStoreURL + '" target="_blank"><img class="steam-logo" src="https://community.akamai.steamstatic.com/public/shared/images/header/logo_steam.svg?t=962016"></a><p><span class="steam-price-el">' + steamPrice + '</span></p></div><div class="price-card"><a href="https://www.g2a.com/search?query=' + wishlist[i].name + '" target="_blank"><img class="g2a-logo" src="https://www.g2a.com/static/assets/images/logo_g2a_white.svg"></a><div class="btn-container"><a href="https://www.g2a.com/search?query=' + wishlist[i].name + '" target="_blank"><button class="price-check-btn">Check Price</button></a></div></div></div></div>'
                            
                            if (steamPrice === "No Price Data") {} // checks for price data
                            else {
                                listItem.innerHTML = listItemHtml

                                // add current list item to list
                                wishlistEl.appendChild(listItem)
                            }
                    });
                }
                else {}
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
        avatarFullEl.src = user.avatarfull // user avatar
        usernameEl.textContent = username // username
        statusEl.textContent = userStatus // user's online status

        // call functions
        getWishlist()
        // getOwnedGames()
    }    
}

// testing values put into API key text input box
oninput = (event) => {
    getPlayerSummaries()
};

// function listOpen() {
//     let wishlistItem = document.querySelector(".wishlist-item")
//     wishlistItem.classList.add("open")
// }