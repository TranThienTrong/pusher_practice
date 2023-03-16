const express = require('express');
const Pusher = require('pusher');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require("path");
const ejs = require('ejs');
const route = require("events");

const app = express();

const pusherConfig = {
    appId: '1569292',
    key: 'ce7bc9131d7523dcc6cf',
    secret: '46befc5996a7e4a02eea',
    cluster: 'ap1',
    useTLS: true
};

const pusher = new Pusher(pusherConfig);

app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');



app.get('/', function(req, res) {
    res.render('index', {
        //pass pusher key to index.ejs for pusher client
        pusherKey: pusherConfig.key
    });
});




app.post('/userMessage', async function(req, res) {
    const username = req.body.username;
    const message = req.body.message;


    console.log("SERVER RECEIVED USER_MESSAGE EVENT: "+JSON.stringify(req.body))

    await pusher.trigger('patecan_chat_room', 'user_message', {
        username: username,
        message: message
    });

    res.status(200).send();

});


app.post('/userTyping', async function(req, res) {
    const username = req.body.username;
    console.log("SERVER RECEIVED USER_TYPING EVENT: "+ JSON.stringify(req.body))

    await pusher.trigger('patecan_chat_room', 'user_typing', {username: username});

    res.status(200).send();
});




const port = 3000;

app.listen(port, () => console.log(`Server running on port ${port}`));
