let key = ""
let steamID = ""
let gameCount = 0
let gameNames = []

const steamIDEl = document.querySelector("#steamID-el")
const keyEl = document.querySelector("#key-el")
const errorEl = document.querySelector("#error-el")
const gamesEl = document.querySelector("#games-el")

// testing values put into API key text input box
// oninput = (event) => {
//     // check input with each input character
// };

function assignValue() {
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
    }
    else {
        fetch(ownedGamesURL)
            .then(response => response.json())
            .then(data => {
                console.log(data)
                gameCount = data.response.game_count
                console.log("Total number of games: " + gameCount)
                for (let i = 0; i < gameCount; i++) {
                    gameNames[i] = data.response.games[i].name
                    gamesEl.innerHTML = "<h3>" + gameNames + "</h3>"
                    console.log(i + ": " + gameNames[i])
                }
            })
            .catch(error => {
                errorEl.style = "opacity: 1; transform: scale(1);"
                errorEl.textContent = ("ERROR: " + error)
            });
    }
}