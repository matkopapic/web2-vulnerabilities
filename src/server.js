const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');

const sqlInjectionLogin = require("./sql-injection");
const {unsecureMe, unsecureLogin, unsecureRegister} = require("./unsecure-auth");
const {secureMe, secureLogin, secureRegister, secureLogout} = require("./secure-auth");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
    }
}))

app.get("/", (req, res) => {
    res.sendFile(path.resolve(__dirname, './public/index.html'));
})

app.post('/login1', sqlInjectionLogin);

app.post('/unsecure-register', unsecureRegister);
app.post('/unsecure-login', unsecureLogin);
app.get('/unsecure-me', unsecureMe);

app.post('/secure-register', secureRegister);
app.post('/secure-login', secureLogin);
app.get('/secure-me', secureMe);
app.post('/secure-logout', secureLogout);

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});