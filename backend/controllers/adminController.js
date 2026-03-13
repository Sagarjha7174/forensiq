const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalCourses = await Course.count();
    const totalEnrollments = await Enrollment.count();

    const revenueRows = await Enrollment.findAll({ attributes: ['amount'] });
    const totalRevenue = revenueRows.reduce((sum, row) => sum + Number(row.amount || 0), 0);

    return res.json({ totalUsers, totalCourses, totalEnrollments, totalRevenue });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch admin stats', error: error.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll({ attributes: { exclude: ['password'] }, order: [['id', 'DESC']] });
    return res.json(users);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.destroy();
    return res.json({ message: 'User deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete user', error: error.message });
  }
};
