let key = ""
let steamID = ""
let gameCount = 0
let gameNames = []

const loginPane = document.querySelector(".login-pane")
const userWelcome = document.querySelector(".user-welcome")
const pageContainer = document.querySelector(".container")
const steamIDEl = document.querySelector("#steamID-el")
const keyEl = document.querySelector("#key-el")
const errorEl = document.querySelector("#error-el")
const gamesEl = document.querySelector("#games-el")

function getPlayerSummaries() {
    steamID = steamIDEl.value
    key = keyEl.value;
    let playerSummaryURL = "http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=" + key + "&steamids=" + steamID
    
    fetch(playerSummaryURL)
        .then(response => response.json())
        .then(data => {
            // do stuff
            userWelcome.textContent = " " + data.response.players[0].personaname
            console.log(data.response.players)
        })
        .catch(error => {});

}

function getOwnedGames() {
    steamID = steamIDEl.value
    key = keyEl.value;
    let ownedGamesURL = "http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?format=json&include_appinfo=true&steamid=" + steamID + "&key=" + key
    
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


        fetch(ownedGamesURL)
            .then(response => response.json())
            .then(data => {
                console.log(data)
                gameCount = data.response.game_count
                console.log("Total number of games: " + gameCount)
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
                    listItem.innerHTML = '<img src="' + imgURL + '"><p>' + gameNames[i] + '</p>'

                    // add current list item to list
                    gamesEl.appendChild(listItem)
                }
                console.log(gameNames)
            })
            .catch(error => {
                errorEl.style = "opacity: 1; transform: scale(1);"
                errorEl.textContent = ("ERROR: " + error)
            });
    }
}

// testing values put into API key text input box
oninput = (event) => {
    getPlayerSummaries()
};