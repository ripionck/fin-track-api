const User = require('../models/User');
const bcrypt = require('bcrypt');

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User profile retrieved successfully', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      bio,
      profileImage,
      currency,
    } = req.body;
    const updates = {};

    if (firstName) updates.firstName = firstName;
    if (lastName) updates.lastName = lastName;
    if (bio) updates.bio = bio;
    if (profileImage) updates.profileImage = profileImage;
    if (currency) updates.currency = currency;

    // Check if email is being updated and ensure it's unique
    if (email) {
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== req.user) {
        return res.status(400).json({ message: 'Email already exists' });
      }
      updates.email = email;
    }

    // Hash the password if it's being updated
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.password = hashedPassword;
    }

    // Update the user
    const updatedUser = await User.findByIdAndUpdate(
      req.user,
      { $set: updates },
      { new: true, runValidators: true },
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User profile updated successfully', updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
module.exports = { getUserProfile, updateUserProfile, deleteUser };
