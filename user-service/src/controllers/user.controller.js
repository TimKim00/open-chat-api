const User = require('../models/user.model');
const Utils = require('../utils/utils');


/** Registers the user */
exports.registerUser = async (req, res) => {
  const { username, password, email, adminStatus } = req.body;

  try {
    // Check that username and password are provided
    const user = await User.findByUsername(username);
    if (user) {
      return res.status(400).json({ msg: 'Registration Failed.' });
    }

    // Create a new user. 
    const newUser = await User.createUser(username, password, email, adminStatus);
    res.status(201).json(Utils.createUserToken(newUser));

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
};

/** Logs in the user */
exports.loginUser = async (req, res) => {
  const { username, password } = req.body;
  try {
    const userInfo = await User.loginUser(username, password);
    if (!userInfo) {
      return res.status(401).json({ msg: 'Login Failed.' });
    }
    return res.status(201).json(Utils.createUserToken(userInfo));
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
};

/** Logs out the user */
exports.logoutUser = async (req, res) => {
  try {
    const result = await User.logoutUser(req.body.username);
    if (!result) {
      return res.status(401).json({ msg: 'Logout Failed.' });
    }
    return res.status(200).json({ msg: 'Logout Successful.' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
};

/** Removes the user account */
exports.deleteUser = async (req, res) => {
  try {
    const result = await User.deleteUser(req.body.username);
    if (!result) {
      return res.status(401).json({ msg: 'Delete Failed.' });
    }
    return res.status(204).json({ msg: 'Delete Successful.' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
}

/** Retreive the user's information. */
exports.getUser = async (req, res) => {
  if (!req.body) {
    return res.status(400).json({ msg: 'User not found.' });
  }

  const { username, userId } = req.body;
  try {
    let result = undefined;
    if (userId) {
      result = await User.findById(userId);
    } else if (username) {
      result = await User.findByUsername(username);
    } else {
      result = req.user;
    }
    if (!result) {
      return res.status(401).json({ msg: 'User not found.' });
    }
    return res.status(201).json(result);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
}

/** Changes the user's information */
exports.updateUser = async (req, res) => {
  const { username, email, adminStatus } = req.body;
  try {
    const result = await User.updateUser(username, email, adminStatus);
    if (!result) {
      return res.status(401).json({ msg: 'Change Failed.' });
    }
    return res.status(201).json(result);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
}

/** Changes the user's password */
exports.changePassword = async (req, res) => {
  const { username, oldPassword, newPassword } = req.body;
  try {
    const result = await User.changePassword(username, newPassword, oldPassword);
    if (!result) {
      return res.status(401).json({ msg: 'Change Failed.' });
    }
    return res.status(201).json({ msg: 'Change Successful.' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
}

/** RESETS THE USER DATABASE */
exports.resetDatabase = async (req, res) => {
  const { resetToken } = req.body;
  try {
    if (Utils.verifyResetToken(resetToken)) {
      const result = await User.resetDatabase();
      if (!result) {
        return res.status(401).json({ msg: 'Reset Failed.' });
      }
      return res.status(201).json({ msg: 'Reset Successful.' });
    } else {
      return res.status(401).json({ msg: 'Unauthorized' });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
}

