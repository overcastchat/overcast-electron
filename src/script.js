var ip = null;
var appName, server;
var link = null;
var themes = {
 navy: {
  theme: "navy",
  light: "white",
  text: "black",
  accent: "cornflowerblue",
  font: "Arial, sans-serif"
 },
 silver: {
  theme: "silver",
  light: "white",
  text: "black",
  accent: "lightslategrey",
  font: "Arial, sans-serif"
 },
 royal: {
  theme: "orangered",
  light: "lightyellow",
  text: "darkslateblue",
  accent: "rebeccapurple",
  font: "Arial, sans-serif"
 },
 midnight: {
  theme: "darkblue",
  light: "black",
  text: "lightsteelblue",
  accent: "darkslateblue",
  font: "Arial, sans-serif"
 },
 sun: {
  theme: "gold",
  light: "linear-gradient(lightblue, 10%, white)",
  text: "darkgoldenrod",
  accent: "limegreen",
  font: "Arial, sans-serif"
 },
 hacker: {
  theme: "green",
  light: "black",
  text: "green",
  accent: "limegreen",
  font: "monospace"
 }
};
// Node section
function startServer(){
 if(typeof require !== "undefined"){
  var PeerServer = require('peer').PeerServer;
  server = PeerServer({port: 9000, path: '/signaler'});
  var http = require('http');
  var fs = require('fs');
  require('dns').lookup(require('os').hostname(), function (err, add, fam) {
   ip = add;
   document.getElementById("ip").innerHTML = "Tell web users to visit <b>" + ip + "</b>";
   document.getElementById("ip").removeAttribute("hidden");
  })
  http.createServer(function (req, res) {
   if(req.url === "/styles.css"){
    fs.readFile('./src/styles.css', function(err, data) {
     res.writeHead(200, {'Content-Type': 'text/css'});
     res.write(data);
     res.end();
    });
   }else if(req.url === "/script.js"){
    fs.readFile('./src/script.js', function(err, data) {
     res.writeHead(200, {'Content-Type': 'application/javascript'});
     res.write(data);
     res.end();
    });
   }else{
    fs.readFile('./src/index.html', function(err, data) {
     res.writeHead(200, {'Content-Type': 'text/html'});
     res.write(data);
     res.end();
    });
   };
  }).listen(80);
  server.on("connection",function (id){
   sendMessage("/addPeer " + id);
   newPeer(peer.connect(id));
  })
 }
}
// End node section
var peer, id, peers;
peers = [];
function msg (usr, s){
 if(s.startsWith("/addPeer")){
  newPeer(peer.connect(s.slice(9)));
  return false;
 };
 var n = s.replace(/(<([^>]+)>)/ig,"");
 var li = document.createElement("LI");
 li.innerHTML = "<b>" + usr + "</b>: " + n;
 document.getElementById("chat").insertBefore(li, document.getElementById("chat").children[0]);
 document.title = usr + ": " + n + " | " + appName;
}
function newPeer(conn) {
 conn.on('open', function() {
  if(peers[conn.peer]){
   peers[conn.peer] = conn;
   msg("Server",conn.peer + " was recconnected!");
  }else{
   peers[conn.peer] = conn;
   msg("Server","New peer: " + conn.peer);
   var li = document.createElement("LI");
   li.innerText = conn.peer;
   li.id = conn.peer;
   document.getElementById("peer-list").appendChild(li);
  };
  conn.on('data', function(data) {
   msg(conn.peer,data);
  });
  conn.on("close",function (){
   msg("Server",conn.peer + " was disconnected.");
   peers[conn.peer].close();
   document.getElementById(conn.peer).innerHTML += " (<b style='color: #ff5500'>Disconnected</b>)";
   peers[conn.peer] = false;
  })
 });
}
function sendMessage(m){
 var peerNames = Object.keys(peers);
 for(var i = 0;i < peerNames.length;i++){
  if(peers[peerNames[i]]){
  peers[peerNames[i]].send(m);
  };
 };
 msg("You",m);
}
function joinServer(id, link){
 peer = new Peer(id.toLowerCase(), {host: (link || ip || location.host), port: 9000, path: '/signaler'});
 peer.on("close",function (){
  msg("Server", "Oh nose, your connection was closed! Reload to try again.");
 });
 peer.on("disconnected",function (){
  msg("Server", "Oh nose, you've been disconnected! Reconnecting in 3 seconds...");
  for(var i = 0;i < Object.keys(peers).length;i++){
   peers[Object.keys(peers)[i]].close();
  };
  peers = [];
  setTimeout(function (){msg("Server","Reconnecting...");peer.reconnect()},3000);
 });
 peer.on("error",function (e){
  if(e.type === "browser-incompatible"){
   alert("Your browser can't run " + appName + "!");
  }else if(e.type === "unavailable-id"){
   alert("Your name is already taken. Reload and choose a new name.");
  }else if(e.type === "invalid-key"){
   alert("Error joining server. Contact the server owner to change the key.");
  }else if(e.type === "network"){
   msg("Server","Error talking to server. Contact the server owner and make sure it is up and running.");
  }else if(e.type === "peer-unavailable"){
   msg("Server","Peer not found on your server. Make sure you spelled it correctly.");
  }else if(e.type === "invalid-id"){
   alert("Your contains unsupported characters. Reload and choose a new name.");
  }else{
   msg("Server","Oh nose, something went wrong! Reload to try again.");
  };
 });
 peer.on("open",function (){
  msg("Server","All set! Add some peers!");
  if(typeof InstallTrigger !== "undefined"){
   msg("Server","In Firefox, you can recieve messages but you cannot send them. Switch to Chrome to send messages.");
   document.getElementById("chat-input-row").setAttribute("hidden","hidden");
  };
  document.getElementById("you-id").innerHTML = peer.id;
  document.getElementById("cover").setAttribute("hidden","hidden");
  peer.on('connection', function(conn) {
   newPeer(conn);
  });
 });
}
window.addEventListener("load",function (){
 appName = document.title;
 if(util.browser === "Unsupported"){
  alert("Oh nose! Your browser can't run "+ appName + "!");
  return false;
 };
 if(typeof require !== "undefined"){
  document.getElementById("close").removeAttribute("hidden");
  document.getElementById("server").removeAttribute("hidden");
 }else{
  document.getElementById("enterName").removeAttribute("hidden");
 };
 document.getElementById("join").addEventListener("click",function (){
  joinServer(document.getElementById("nameInput").value);
 });
 document.getElementById("joinServer").addEventListener("click",function (){
  var link = document.getElementById("linkInput");
  document.getElementById("server").setAttribute("hidden","hidden");
  document.getElementById("enterName").removeAttribute("hidden");
 });
 document.getElementById("custom").addEventListener("click",function (){
  startServer();
  document.getElementById("server").setAttribute("hidden","hidden");
  document.getElementById("enterName").removeAttribute("hidden");
 });
 document.getElementById("chat-btn").addEventListener("click",function (){
  var m = document.getElementById("chat-input").value;
  document.getElementById("chat-input").value = "";
  sendMessage(m);
 })
 document.getElementById("close").addEventListener("click",function (){window.close()})
 document.getElementById("theme-select").addEventListener("change",function (e){
  var newTheme = e.target.value;
  var cssString = `
:root {
 --theme: ` + themes[newTheme].theme + `;
 --theme-light: ` + themes[newTheme].light + `;
 --theme-accent: ` + themes[newTheme].accent + `;
 --text: ` + themes[newTheme].text + `;
 --font: ` + themes[newTheme].font + `;
}
  `;
  document.getElementById("theme").innerHTML = cssString;
 })
})