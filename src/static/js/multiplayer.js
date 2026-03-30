const titleElement= document.getElementById("title");
var adminName = "";
const playerName = localStorage.getItem("username") || "Unknown Player";
const playersElement = document.getElementById("players");

function refreshState(){
    fetch("/get_admin_name")
    .then(response => response.json())
    .then(data => {
        adminName = data.admin_name;
        titleElement.textContent = `Hello, ${playerName}\n(Admin: ${adminName})`;
        document.title = `Brain Cruncher - ${playerName}`;
    });
}

function loopUntilStart(){
    fetch("/check_start")
    .then(response => response.json())
    .then(data => {
        // if(data.started){
        //     window.location.href = "/game";
        // } else {
        //     setTimeout(loopUntilStart, 1000); // Check again after 1 second
        // }
        
        players=data.players;
        playersElement.textContent = document.createElement("p").textContent = "Players:";
        for (let i=0; i<players.length; i++){
            // playersElement.appendChild(document.createElement("br"));
            playersElement.appendChild(document.createElement("p")).textContent = `- ${players[i]}`;
            
        }
        setTimeout(loopUntilStart, 5000); // Check again after 1 second
    });
}


document.addEventListener("DOMContentLoaded", function() {
    refreshState();
    loopUntilStart();
});