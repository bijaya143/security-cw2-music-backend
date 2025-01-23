const bcryptjs = require("bcryptjs");

const SALT_ROUND = 10;

// Hash user password with salt
function hash(password) {
  return bcryptjs.hash(password, SALT_ROUND);
}

function compare(password, hashedPassword) {
  return bcryptjs.compare(password, hashedPassword);
}

module.exports = {
  hash,
  compare,
};
