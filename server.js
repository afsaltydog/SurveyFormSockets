const express = require("express");
const session = require('express-session');
const app = express();

app.set('views', __dirname + '/views'); 
app.set('view engine', 'ejs');

app.use(express.static(__dirname + "/static"));

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

const server = app.listen(1337);
const io = require('socket.io') (server);

var rando = 0;

io.on('connection', function (socket) { //2
    var stuff = "";
    socket.emit('greeting', { msg: 'Greetings, from server Node, brought to you by Sockets! -Server' }); //3
    socket.emit("You emitted the following information to the server: ", { name: session.name, location: session.location, language: session.language, comment: session.comment});
    socket.on('thankyou', function (data) { //7
      console.log("Socket: "+data.msg); //8 (note: this log will be on your server's terminal
    });

    socket.on('Testing', function(data) { 
        console.log("We connected via Testing...", data);
        console.log("data.form is type: "+typeof(data.form));
        socket.emit('updated_message', { msg: data.form });
        rando = Math.floor((Math.random() * 1000) + 1);
        console.log("rando is "+rando.toString());
        socket.emit('random_number', { msg: rando });
    });
    
});

app.get("io")

app.use(session({
    secret: 'keyboardkittey',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
}))

const route = express.Router();

module.exports = (io) => {
    console.log(io);
    route.get('/', (request, response) => {
        console.log(io);

        io.on('RouteEvent', msg => {
            console.log(msg);
        });

        response.json({
            'RES': 'No Socket IO data'
        });
    });

    return route; // add this return statement
}

app.get('/', function(request, response) {
    if ("count" in request.session == false) {
        request.session.count = 0
    } 
    else {
        request.session.count++;
    }
    // req = convertToText(request);
    console.log("Request: "+request.keys);
    response.render('index', {count:request.session.count});
})

app.post('/users', function (request, res){
    console.log("POST DATA \n\n", request.body)
    console.log("name:", request.body.name);
    console.log("location:", request.body.location);
    console.log("language:", request.body.language);
    console.log("comment:", request.body.comment);
    request.session.name = request.body.name;
    request.session.location = request.body.location;
    request.session.language = request.body.language;
    request.session.comment = request.body.comment;
    // redirect the user back to the root route.  
    res.redirect('/')
});

// app.get("/users/:id", function (request, res){
//     console.log("The user id requested is:", request.params.id);
//     // just to illustrate that req.params is usable here:
//     res.send("You requested the user with id: " + request.params.id);
//     // code to get user from db goes here, etc...
// });

app.listen(8000, function() {
    console.log("listening on port 8000");
})