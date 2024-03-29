const io = require("socket.io")();
const uuidv1 = require("uuid/v1");
const messageHandler = require("./handlers/mesage.handler");

const users = {};

function createUserAvatar() {
  const rand1 = Math.round(Math.random() * 200 + 100);
  const rand2 = Math.round(Math.random() * 200 + 100);

  return `https://placeimg.com/${rand1}/${rand2}/any`;
}

function createUsersOnline() {
  const values = Object.values(users);
  console.log(values);
  const onlyWithUsernames = values.filter((u) => u.username !== undefined);
  return onlyWithUsernames;
}

io.on("connection", (socket) => {
  console.log("a user connect");
  console.log(socket.id);
  users[socket.id] = { userId: uuidv1() };

  // socket.on("join", (username) => {
  //   users[socket.id].username = username;
  //   users[socket.id].avatar = createUserAvatar();

  //   messageHandler.handleMessage(socket, users);
  // });
  socket.on("disconnect", () => {
    delete users[socket.id];
    io.emit("action", { type: "users_online", data: createUsersOnline() });
  });
  socket.on("action", (action) => {
    switch (action.type) {
      // case "server/hello":
      //   console.log("Got hello event  ", action.data);
      //   socket.emit("action", { type: "message", data: "Good day!" });
      //   break;
      case "server/join":
        console.log("Got join event", action.data);
        users[socket.id].username = action.data;
        users[socket.id].avatar = createUserAvatar();
        io.emit("action", {
          type: "users_online",
          data: createUsersOnline(),
        });
        socket.emit("action", { type: "self_user", data: users[socket.id] });
        break;
        case "server/private_message":
          console.log("22222222222222")
          const conversationId = action.data.conversationId;
          const from = users[socket.id].userId;
          const userValues = Object.values(users);
          const socketIds = Object.keys(users);
          for (let i = 0; i < userValues.length; i++) {
            if (userValues[i].userId === conversationId) {
              const socketId = socketIds[i];
              io.sockets.sockets[socketId].emit("action", {
                type: "private_message",
                data: {
                  ...action.data,
                  conversationId: from
                }
              });
              break;
            }
          }
          break;
    }
  });
});

io.listen(3001);
