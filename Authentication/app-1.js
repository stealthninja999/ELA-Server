const express = require('express');
const bodyParser = require('body-parser');

/** 
 * The LTI Learning Tool application 
 */
var app = express();

// If we are serving our app through a proxy server,
// the proxy server may be using HTTPS protocol while
// the express server is using HTTPS.  This will
// cause the OAuth signatures to not match.  Setting 
// a proxy trust setting on express will have it 
// reflect the protocol used by the proxy instead.
var trustProxy = process.env.TRUST_PROXY; 
if(trustProxy) {
  // The 'trust proxy' setting can either be a boolean
  // (blanket trust any proxy) or a specific ip address
  if(trustProxy === "true") app.set('trust proxy', true);
  else app.set('trust proxy', trustProxy);
}

// We use the bodyparser middleware to process incoming
// request bodies
app.use(bodyParser.urlencoded({extended: false}));

// For this app we have a single route that responds to
// LTI launch requests. 
app.post('/', require('./middleware/verify-lti-launch'), require('./endpoints/lti-launch'));

module.exports = app;