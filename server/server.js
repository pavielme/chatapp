var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var fs = require('fs');

const databaseData = (id) => {
    var read = fs.readFileSync('./database.json');
    var data = JSON.parse(read);

    return data[id];
}

const checkMessage = (messages) => {
    var newmessage = false;

    for(var i in messages) {
        if(messages[i].type === 'received' && !messages[i].opened){
            newmessage = true;
        }
    }

    return newmessage;
}

const setRoom = (id, room) => {
  var read = fs.readFileSync('./database.json');
  var data = JSON.parse(read);

  data[id].room = room;

  fs.writeFileSync('./database.json', JSON.stringify(data, null, 4));
}

const setRead = (id, room) => {
  var read = fs.readFileSync('./database.json');
  var data = JSON.parse(read);

  var messages = data[id].friends[room].messages;

  for(var i in messages) {
    data[id].friends[room].messages[i].opened = true;
  }

  fs.writeFileSync('./database.json', JSON.stringify(data, null, 4));
}
io.on('connection', (socket) => {
  socket.on('connect user', (id, callback) => {
    socket.username = id;

    setRoom(id, true);

    callback(socket.id);
  });

  socket.on('load friends', (id, callback) => {    
    var database = databaseData(id);
    var friends = database.friends;

    var list = [];

    for(var room in friends){
        var friend = databaseData(friends[room].id);
        var messages = friends[room].messages;

        list.push({
            room: room,
            user: {
                id: friends[room].id,
                name: friend.name,
                username: friend.username,
            },
            message: {
                new: checkMessage(messages),
                last: friends[room].last_change,
            }
        });    
    }

    callback(list);
  });

  socket.on('load messages', (id, room, callback) => {
    socket.join(room);

    var database = databaseData(id);
    var messages = database.friends[room].messages;

    setRead(id, room);

    callback(messages);
  });

  socket.on('leave room', (id, room, callback) => {
    setRead(id, room);
    socket.leave(room);
    callback('left ' + room);
  });

  socket.on('send message', (id, target, text, callback) => {
    socket.to(target.room).emit('receive message', text);

    var read = fs.readFileSync('./database.json');
    var data = JSON.parse(read);

    var currenttimestamp = new Date().getTime();

    data[id].friends[target.room].messages.push({
        type: 'send',
        text: text,
        opened: true,
        ts: currenttimestamp
    });

    data[id].friends[target.room].last_change = currenttimestamp;

    data[target.user.id].friends[target.room].messages.push({
       type: 'received',
       text: text,
       opened: false,
       ts: currenttimestamp
    });

    data[target.user.id].friends[target.room].last_change = currenttimestamp;

    fs.writeFileSync('./database.json', JSON.stringify(data, null, 4));

  });

  socket.on('disconnect', () => {
    if(socket.username){
      setRoom(socket.username, false);

      
    }
  });
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});