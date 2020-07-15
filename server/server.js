var app = require('express')();
var https = require('https');
var fs = require('fs');

var options = {
    key: fs.readFileSync('./chat.pem'),
    cert: fs.readFileSync('./chat.crt')
  };

var serverPort = 3000;

var server = https.createServer(options, app);

var io = require('socket.io')(server, { 
    origins: '*:*'
});


app.get('/', (req, res) => {
    res.send('<h1>Hello world</h1>');
});

const pushNotification = function(senderName, Token){
  var POSTREQUEST = require("https");
  var options = {
      method: "POST",
      hostname: 'api.pushbots.com',
      path: '/3/push/transactional',
      port: 443,
      headers: {
          "x-pushbots-appid": "5f081210e5b4184a2021917b",
          "x-pushbots-secret": "a91735cf2ee0d0587dc9b4ef21b33c4c",
          "Content-Type": "application/json"
      }
  };


  var data = JSON.stringify({ 
      topic: 'transactional_notification',
      platform: 1,
      message: { 
          title: 'Från',
          body: senderName,
          payload: { 
              sound: 'siren.wav' 
          } 
      },
      recipients: { 
          tokens: [ Token ] 
      }
  });
  
  const req = POSTREQUEST.request(options, (res) => {
    
      res.on('data', (d) => {
      //   process.stdout.write(d)
      })
    })
    
    req.on('error', (error) => {
      console.error(error)
    })
    
    req.write(data)
    req.end()
}

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

const targetInRoom = (id) => {
  var read = fs.readFileSync('./database.json');
  var data = JSON.parse(read);

  var room = data[id].room;

  return room;
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
  socket.on('connect user', (id, callback) => {
    console.log(id + ': ' + socket.id);
    socket.username = id;

    setRoom(id, true);

    callback(socket.id);
  });

  socket.on('set Token', (id, token, callback) => {
    console.log(id + '_token: ' + token);
    setToken(id, token);
    callback(token);
  });

  socket.on('login', (username, password, callback) => {
    var read = fs.readFileSync('./database.json');
    var data = JSON.parse(read);

    var res = false;

    for(var id in data){
      if(data[id].username == username && data[id].password == password){
        res = {
          id: id,
          name: data[id].name,
          username: data[id].username,
          avatar: data[id].avatar,
        }

        break;
      }
    }

    callback(res);
  });

  socket.on('change avatar', (id, url) => {
    var read = fs.readFileSync('./database.json');
    var data = JSON.parse(read);

    data[id].avatar = url;

    fs.writeFileSync('./database.json', JSON.stringify(data, null, 4));
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
                avatar: friend.avatar,
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
    var inRoom = targetInRoom(database.friends[room].id);

    console.log(inRoom);
    
    if(inRoom === room){
      io.in(room).emit('joined')
    } else {
      socket.to(room).emit('joined');
    }

    var messages = database.friends[room].messages;

    // var filterOpened = [];

    // for(var i in messages){
    //   if(!messages[i].opened) {
    //     filterOpened.push(messages[i]);
    //   } else if (messages[i].save) {
    //     filterOpened.push(messages[i]);
    //   }
    // }

    callback(messages);
  });

  socket.on('snapshot messages', (id, room, callback) => {
    var database = databaseData(id);
    var messages = database.friends[room].messages;

    // var filterOpened = [];

    // for (var i in messages) {
    //   if (!messages[i].opened) {
    //     filterOpened.push(messages[i]);
    //   } else if (messages[i].save){
    //     filterOpened.push(messages[i]);
    //   }
    // }

    callback(messages);
  });

  socket.on('togglesave messages', (id, room, index, callback) => {
    var read = fs.readFileSync('./database.json');
    var data = JSON.parse(read);

    var state = data[id].friends[room].messages[index].save ? false : true;

    data[id].friends[room].messages[index].save = state;

    fs.writeFileSync('./database.json', JSON.stringify(data, null, 4));

    callback(state);
  });

  socket.on('leave room', (id, room, callback) => {
    setRead(id, room);
    setRoom(id, true);

    io.in(room).emit('typing', false);
    io.in(room).emit('left');

    socket.leave(room);

    callback('left ' + room);
  });

  socket.on('typing', (room, state) => {
    socket.to(room).emit('typing', state);
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
      socket.to(target.room).emit('typing', false);
      socket.to(target.room).emit('receive message', text);
      setRead(target.user.id, target.room);
    } else if(status === 'inapp'){
      var name = databaseData(id).name;
      io.emit('notification id_' + target.user.id, name);
    } else if(status === 'push'){
      
      var name = databaseData(id).name;
      var token = databaseData(target.user.id).token;

      if(token){
        console.log('push')
        pushNotification(name, token);
      }
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

  socket.on('send image', (id, target, image, callback) => {

    var status = checkIsRoom(target.user.id, target.room);

    if (status === 'chat') {
      socket.to(target.room).emit('typing', false);
      socket.to(target.room).emit('receive image', image);
      setRead(target.user.id, target.room);
    } else if (status === 'inapp') {
      var name = databaseData(id).name;
      io.emit('notification id_' + target.user.id, name);
    } else if (status === 'push') {

      var name = databaseData(id).name;
      var token = databaseData(target.user.id).token;

      if (token) {
        console.log('push')
        pushNotification(name, token);
      }
    }

    var read = fs.readFileSync('./database.json');
    var data = JSON.parse(read);

    var currenttimestamp = new Date().getTime();

    data[id].friends[target.room].messages.push({
      type: 'send',
      image: image,
      opened: true,
      ts: currenttimestamp
    });

    data[id].friends[target.room].last_change = currenttimestamp;

    data[target.user.id].friends[target.room].messages.push({
      type: 'received',
      image: image,
      opened: false,
      ts: currenttimestamp
    });

    data[target.user.id].friends[target.room].last_change = currenttimestamp;

    fs.writeFileSync('./database.json', JSON.stringify(data, null, 4));

  });

  socket.on('disconnect', () => {
    if(socket.username){

      var room = targetInRoom(socket.username);

      if(typeof room === 'string' || room instanceof String){
        io.in(room).emit('typing', false);
        io.to(room).emit('left');
      }

      setRoom(socket.username, false);

      
    }
  });
});

server.listen(serverPort, () => {
  console.log('listening on *:' + serverPort);
});