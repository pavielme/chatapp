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
    var newmessage = 0;

    for(var i in messages) {
        if(messages[i].type === 'received' && !messages[i].opened){
            newmessage++
        }
    }

    return newmessage;
}

const checkIsRoom = (id, room) => {
  var data = databaseData(id);

  if(data.room === room){
    return 'chat';
  } else if(data.room === false){
    return 'push'
  } else {
    return 'inapp'
  }
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

const setToken = (id, token) => {
  var read = fs.readFileSync('./database.json');
  var data = JSON.parse(read);

  data[id].token = token;

  fs.writeFileSync('./database.json', JSON.stringify(data, null, 4));
}

io.on('connection', (socket) => {
  socket.on('connect user', (id, token, callback) => {
    socket.username = id;

    setToken(id, token);
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

    setRoom(id, room);

    var database = databaseData(id);
    var messages = database.friends[room].messages;

    setRead(id, room);

    callback(messages);
  });

  socket.on('leave room', (id, room, callback) => {
    setRead(id, room);
    setRoom(id, true);

    socket.leave(room);
    callback('left ' + room);
  });

  socket.on('clear room', (id, room) => {
    var read = fs.readFileSync('./database.json');
    var data = JSON.parse(read);

    data[id].friends[room].messages = [];

    fs.writeFileSync('./database.json', JSON.stringify(data, null, 4));
  });

  socket.on('send message', (id, target, text, callback) => {

    var status = checkIsRoom(target.user.id, target.room);

    if(status === 'chat') {
      socket.to(target.room).emit('receive message', text);
    } else if(status === 'inapp'){
      var name = databaseData(id).name;
      io.emit('notification id_' + target.user.id, name);
    } else if(status === 'push'){

    }

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