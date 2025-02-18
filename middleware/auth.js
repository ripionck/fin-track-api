const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new Error();
    }
    req.user = user;
    next();
  } catch (err) {
    res
      .status(401)
      .send({ error: 'Authentication required. Please log in to continue.' });
  }
};

module.exports = auth;
