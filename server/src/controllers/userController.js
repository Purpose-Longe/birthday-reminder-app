const User = require('../models/User');

async function listUsers(req, res) {
  const users = await User.find().sort({ createdAt: -1 }).lean();
  return res.json(users.map(u => ({ id: u._id, username: u.username, email: u.email, dob: u.dob })));
}

async function createUser(req, res) {
  const { username, email, dob } = req.body;
  if (!username || !email || !dob) return res.status(400).json({ message: 'username, email and dob required' });

  // basic email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return res.status(400).json({ message: 'Invalid email' });

  try {
    const user = new User({ username, email, dob });
    await user.save();
    return res.status(201).json({ id: user._id, username: user.username, email: user.email, dob: user.dob });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Email already exists' });
    }
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function deleteUser(req, res) {
  const { id } = req.params;
  try {
    await User.findByIdAndDelete(id);
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { listUsers, createUser, deleteUser };
