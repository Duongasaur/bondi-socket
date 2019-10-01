const http = require("http");
const express = require("express");
const sockjs = require("sockjs");
const cors = require("cors");

const PORT = process.env.PORT || 8080;

const sockjs_opts = {
  prefix: "/echo"
};

// Clients list
const clients = {};

// Broadcast to all clients
function broadcast(message) {
  // iterate through each client in clients object
  for (const client in clients) {
    // send the message to that client
    clients[client].write(JSON.stringify(message));
  }
}

const sockjsEcho = sockjs.createServer(sockjs_opts);
sockjsEcho.on("connection", conn => {
  // add this client to clients object
  clients[conn.id] = conn;

  // on receive new data from client event
  conn.on("data", function(message) {
    console.log(message); // Send message to the server terminal
    broadcast(JSON.parse(message));
  });

  // on connection close event
  conn.on("close", function() {
    delete clients[conn.id];
  });
});

const app = express();

app.post("/send", (req, res) => {
  broadcast(req.query);
  return res.send("Message broadcasted!");
});

app.get("/", (req, res) => res.send("welcome to bondi bet broadcaster!"));

app.use(cors);
const server = http.createServer(app);
server.listen(PORT);
sockjsEcho.installHandlers(server, { prefix: "/echo" });
