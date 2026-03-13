const Notification = require('../models/Notification');
const { Op } = require('sequelize');
const Enrollment = require('../models/Enrollment');

exports.getNotifications = async (req, res) => {
  try {
    const where = {};

    if (req.user && req.user.role !== 'admin') {
      const classId = req.user.class_id;
      const enrollments = await Enrollment.findAll({ where: { user_id: req.user.id } });
      const courseIds = enrollments.map((e) => e.course_id);

      where[Op.or] = [
        { class_id: null, course_id: null },
        { class_id: classId },
        ...(courseIds.length ? [{ course_id: { [Op.in]: courseIds } }] : [])
      ];
    }

    const notifications = await Notification.findAll({ where, order: [['id', 'DESC']] });
    return res.json(notifications);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch notifications', error: error.message });
  }
};

exports.createNotification = async (req, res) => {
  try {
    const { title, message, class_id, course_id } = req.body;
    const notification = await Notification.create({ title, message, class_id, course_id });
    return res.status(201).json(notification);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create notification', error: error.message });
  }
};

exports.updateNotification = async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    await notification.update(req.body);
    return res.json(notification);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update notification', error: error.message });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    await notification.destroy();
    return res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete notification', error: error.message });
  }
};
