const path = require('path');
const dotenv = require('dotenv');

const result = dotenv.config({ path: '../.env' });
console.log(result);
