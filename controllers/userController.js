const User = require('../models/User');
const bcrypt = require('bcrypt');

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
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
    const updates = {}; // Object to hold the fields to update

    if (firstName) updates.firstName = firstName;
    if (lastName) updates.lastName = lastName;
    if (email) updates.email = email;
    if (bio) updates.bio = bio;
    if (profileImage) updates.profileImage = profileImage;
    if (currency) updates.currency = currency;

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.password = hashedPassword;
    }

    // Find and update the user, ensuring it's the logged-in user
    const updatedUser = await User.findByIdAndUpdate(
      req.user, // The user ID from the auth middleware
      { $set: updates }, // Use $set to update specific fields
      { new: true, runValidators: true }, // Return the updated document and validate updates
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
