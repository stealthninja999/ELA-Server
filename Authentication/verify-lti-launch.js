const lti = require('ims-lti');

/** @module verify-lti-launch 
 * This express middleware validates an LTI 1.0 launch attempt
 * to make sure it has not been tampered with during transmission.
 * 
 * To do this requires a consumer key and a shared secret, 
 * both of which are shared with the LMS system (i.e. canvas)
 * sending the launch request.
 * 
 * For this simple implementation, these are stored as environment 
 * variables, but for an implementation serving multiple LMS 
 * systems (i.e. multiple schools), you would want to have 
 * separate consumer key and shared secret for each (and 
 * probably store them in a database). 
*/
module.exports = function(req, res, next) {
  
  // We use the ims-lti node library to validate the 
  // launch request.  We must provide it with the client key
  // and secret.
  const key = process.env.CLIENT_KEY;
  const secret = process.env.SHARED_SECRET;
  const provider = new lti.Provider(key, secret);
  provider.valid_request(req, (err, isValid) => {
    if(err || !isValid) {
      // If we enter this body, either we encountered an error,
      // or the launch request was found to be invalid.  In either
      // case, we give the user a 401 error and log the error to
      // our server.  We avoid sending details of the issue to
      // the client, as doing so can help an adversary learn 
      // more about how to counteract our security. 
      console.error(err);
      res.status(401).send("Unauthorized");
      return;
    };
    // If we reach this point, our launch request
    next();
  })
}