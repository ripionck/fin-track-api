const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    await user.save();
    res.status(201).send(user);
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.send({ user, token });
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
};

const getProfile = async (req, res) => {
  res.send(req.user);
};

const updateProfile = async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['firstName', 'lastName', 'bio', 'currency'];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update),
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates!' });
  }

  try {
    updates.forEach((update) => (req.user[update] = req.body[update]));
    await req.user.save();
    res.send(req.user);
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
};

const uploadAvatar = async (req, res) => {
  try {
    req.user.avatar = req.file.path;
    await req.user.save();
    res.send(req.user);
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
};

const deleteAccount = async (req, res) => {
  try {
    await req.user.deleteOne();
    res.send({ message: 'Account deleted successfully' });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  uploadAvatar,
  deleteAccount,
};
