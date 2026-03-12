import User from '../models/User.js';
import { validationResult } from 'express-validator';
import bcryptjs from 'bcryptjs';

export const updateProfile = async (req, res) => {
  try {
    const { name, phone, profilePhoto, location } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (profilePhoto) updateData.profilePhoto = profilePhoto;
    if (location) updateData.location = { ...location, updatedAt: new Date() };

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profilePhoto: user.profilePhoto,
        location: user.location,
        rating: user.rating,
        completedTasks: user.completedTasks
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user statistics
    const Task = (await import('../models/Task.js')).default;
    const completedTasks = await Task.countDocuments({
      acceptedBy: user._id,
      status: 'completed'
    });

    res.json({
      user: {
        id: user._id,
        name: user.name,
        profilePhoto: user.profilePhoto,
        rating: user.rating,
        completedTasks: completedTasks,
        verificationStatus: user.verificationStatus,
        location: user.location
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');

    // Verify current password
    const isCorrect = await user.matchPassword(currentPassword);
    if (!isCorrect) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
