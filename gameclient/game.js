let base = "ws://localhost:9090/gameserver/";
let ws = null;
let name = "";
let users = [];




let startGame = () => {
    name = document.getElementById('nick').value;
    document.getElementById('game').style.display = '';
    document.getElementById('welcome').style.display = 'none';
    var url = base + name + "?pos=0,0";
    ws = new WebSocket(url);

    // Assign the onMessage function to handle the new messages via WebSocket
    ws.onmessage = onMessage;
    
    // Assign the onClose function to handle the WebSocket connection terminations
    ws.onclose = onClose;

    let player = document.createElement('div');
    player.style.top = '50px';
    player.style.left = '50px';
    player.id = 'player';
    document.getElementById('game').appendChild(player); 

    

    window.onkeydown = (e) => {
        console.log(e);
        if(e.keyCode == 37) {
            playerLeft();
        }
        if(e.keyCode == 39) {
            playerRight();
        }
        if(e.keyCode == 40) {
            playerUp();
        }
        if(e.keyCode == 38) {
            playerDown();
        }
        ws.send(parseFloat(document.getElementById('player').style.left) + ',' + parseFloat(document.getElementById('player').style.top));
    }

    startLoop();
}

let playerUp = () => {
    document.getElementById('player').style.top = (parseFloat(document.getElementById('player').style.top) + 5) + 'px';

}

let playerDown = () => {
    document.getElementById('player').style.top = (parseFloat(document.getElementById('player').style.top) - 5) + 'px';
}

let playerLeft = () => {
    document.getElementById('player').style.left = (parseFloat(document.getElementById('player').style.left) - 5) + 'px';
}

let playerRight = () => {
    document.getElementById('player').style.left = (parseFloat(document.getElementById('player').style.left) + 5) + 'px';
}


let startLoop = () => {
    setInterval(() => {
        ws.send(parseFloat(document.getElementById('player').style.left) + ',' + parseFloat(document.getElementById('player').style.top));
    },500);
}


function onMessage(msg) {
    j = JSON.parse(msg.data);
    // Display the received message in the web page
    console.log(j);

    if(j.user) {
        addOther(j);
    }

    if(j.update) {
        if(j.update != name)
            moveOther(j);
    }

    if(j.left) {
        leftOther(j);
    }
}

function onClose(evt) {
    console.log(evt);
   
}



let addOther = (j) => {
    let player = document.createElement('div');
    player.style.top = '50px';
    player.style.left = '50px';
    player.id = 'other_' + j.user;
    users.push(j.user);
    player.className = 'other';
    document.getElementById('game').appendChild(player); 
}

let moveOther = (j) => {
    let pos = j.pos.split(',');
    if(users.indexOf(j.update) == -1) {
        addOther({
            user : j.update
        });
    }
    document.getElementById('other_' + j.update).style.left = pos[0] + 'px';
    document.getElementById('other_' + j.update).style.top = pos[1] + 'px';
}

let leftOther = (j) => {
    let el = document.getElementById('other_' + j.left);
    document.getElementById('game').removeChild(el);
    
}