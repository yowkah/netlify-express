'use strict';
const express = require('express');
const serverless = require('serverless-http');
const app = express();
const cookieParser = require('cookie-parser');
const path = require('path');

const router = express.Router();

app.use(express.json());

app.use(cookieParser('allKeyboardCatsAssembleNextFridayPlease'))

const users = {
  timo: 'timmy',
  yowkah: 'netlifygod'
}

// making sure we can access lambda
app.use('/.netlify/functions/server', router);  // path must route to lambda
app.use('/', (req, res) => res.sendFile(path.join(__dirname, '../index.html')));

// if we receive a post request on the login endpoint
router.post('/login', (req, res) => {
  if(users[req.body.username] === req.body.password) {
    res.cookie('loginValidUntill', Date.now() + (12 * 60 * 60 * 1000), {signed: true}) //12 hours
    res.send();
  }
  else {
    res.status(403).send();
  }
})

router.get('/logout', (req, res) => {
  res.cookie('loginValidUntill', Date.now(), {signed: true});
})

router.get('/login', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../public/index.html'));
});

// securing all the routes behind the secure path
router.get('/secure/*', (req, res, next) => {
  console.log('secure ayyy');
  if(req.signedCookies.loginValidUntill && req.signedCookies.loginValidUntill*1 > Date.now()) next();
  else {
    res.redirect('/.netlify/functions/server/login');
  }
})

// for everything that gest through, we serve the static files in /public

router.get('*', express.static('public'));


module.exports = app;
module.exports.handler = serverless(app);
