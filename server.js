///File is primarily here as a placeholder.  Revisit
///as further functionality is implemented

// Load environment variables 
require('dotenv').config();

// Create the application
const app = require('./src/app');

// Start listening for http requests
const port = process.env.PORT || 3000; 
app.listen(port, () => console.log(`Listening on port ${port}`));