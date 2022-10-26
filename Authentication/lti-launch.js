const axios = require('axios');
const OAuth1Signature = require('oauth1-signature');

/** @module lti-launch
 * Handles an incoming LTI Launch Request
 */
module.exports = async function launch(req, res) {

  // The body of a launch request contains a lot 
  // of variables, both from the lti standard and
  // custom variables added by the LMS. We'll dump
  // these to the console so you can review them:
  console.log(req.body);

  // Of especial importance for passing grades 
  // back to the LMS are the lis_result_sourcedid which 
  // uniquely identifies the student, assignment, and
  // context (course section), and the 
  // lis_outcome_service_url to submit the grade to 
  const { lis_result_sourcedid, lis_outcome_service_url} = req.body;

  // Additionally, the roles are important, because an 
  // Instructor role will not have a lis_sourcedid as 
  // they are not receiving grades.
  const roles = req.body.roles.split(',');
  if(roles.includes('Instructor')) {
    res.send(`Hello instructor ${req.body.lis_person_name_family}! Try using Student View.`);
    return;
  }

  // The grades passed back are in the form of a 
  // float between 0 and 1, corresponding to a percentage
  const grade = 0.98;

  // The body of the grade posting request is an XML document
  // with a specific structure:
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <imsx_POXEnvelopeRequest xmlns="http://www.imsglobal.org/services/ltiv1p1/xsd/imsoms_v1p0">
      <imsx_POXHeader>
        <imsx_POXRequestHeaderInfo>
          <imsx_version>V1.0</imsx_version>
          <imsx_messageIdentifier>999999123</imsx_messageIdentifier>
        </imsx_POXRequestHeaderInfo>
      </imsx_POXHeader>
      <imsx_POXBody>
        <replaceResultRequest>
          <resultRecord>
            <sourcedGUID>
              <sourcedId>${lis_result_sourcedid}</sourcedId>
            </sourcedGUID>
            <result>
              <resultScore>
                <language>en</language>
                <textString>${grade}</textString>
              </resultScore>
            </result>
          </resultRecord>
        </replaceResultRequest>
      </imsx_POXBody>  
    </imsx_POXEnvelopeRequest>`;

  // The request must also contain Oauth parameters
  // and a signature to validate it on the LMS side:
  const signature = OAuth1Signature({
    consumerKey: process.env.CLIENT_KEY,
    consumerSecret: process.env.SHARED_SECRET,
    url: lis_outcome_service_url,
    method: 'POST',
    queryParams: {} // if you need to post additional query params, do it here
  });

  // Then send the request (note that this does
  // not need to be done immediately - it can be 
  // done at a future point, but you must know the 
  // lis_sourcedid and the lis_outcome_service_url)
  try {

    const response = await axios.request({
      url: lis_outcome_service_url,
      params: signature.params,
      method: 'post',
      headers: {'Content-Type': 'application/xml'},
      data: xml,
    });
    
    if(response.status == 200) {
      // a 200 status code indicates success
      res.send(`You earned a grade of ${grade}.`);
    } else {
      console.error('Error response received', response.status);
      res.status(500).send("Server Error");
    }

  } catch(err) {
    console.error('foobar', err);
    res.status(500).send("Server Error");
  }
}
