const crypto = require('crypto');

exports.generateToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

// other helper functions (email sending, calculations, etc.)
