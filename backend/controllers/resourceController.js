const { Op } = require('sequelize');
const Resource = require('../models/Resource');
const Notification = require('../models/Notification');
const Enrollment = require('../models/Enrollment');

exports.getResources = async (req, res) => {
  try {
    const where = {};

    if (req.user.role !== 'admin') {
      const enrollments = await Enrollment.findAll({ where: { user_id: req.user.id } });
      const enrolledCourseIds = enrollments.map((e) => e.course_id);
      if (enrolledCourseIds.length === 0) return res.json([]);
      where.course_id = { [Op.in]: enrolledCourseIds };
    }

    if (req.query.course_id) where.course_id = req.query.course_id;
    if (req.query.type) where.type = req.query.type;

    const resources = await Resource.findAll({ where, order: [['order_index', 'ASC'], ['id', 'ASC']] });
    return res.json(resources);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch resources', error: error.message });
  }
};

exports.createResource = async (req, res) => {
  try {
    const { title, type, course_id, content_url, order_index = 0 } = req.body;
    if (!course_id) return res.status(400).json({ message: 'course_id is required' });

    const resource = await Resource.create({ title, type, course_id, content_url, order_index });

    const messageMap = {
      lecture: 'New Lecture Uploaded',
      pdf: 'New Study Material Uploaded',
      quiz: 'New Quiz Available',
      announcement: 'New Announcement Posted'
    };

    await Notification.create({
      title: messageMap[type] || 'New Resource Added',
      message: `${title} has been added to your learning resources.`,
      course_id
    });

    return res.status(201).json(resource);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create resource', error: error.message });
  }
};
