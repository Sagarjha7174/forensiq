const { Op } = require('sequelize');
const Resource = require('../models/Resource');
const Notification = require('../models/Notification');

exports.getResources = async (req, res) => {
  try {
    const where = {};

    if (req.user.role !== 'admin') {
      where[Op.or] = [
        { class_id: req.user.class_id },
        { course_id: req.user.course_id },
        { class_id: null, course_id: null }
      ];
    }

    if (req.query.course_id) {
      where.course_id = req.query.course_id;
    }

    if (req.query.type) {
      where.type = req.query.type;
    }

    const resources = await Resource.findAll({ where, order: [['id', 'DESC']] });
    return res.json(resources);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch resources', error: error.message });
  }
};

exports.createResource = async (req, res) => {
  try {
    const { title, type, class_id, course_id, content_url } = req.body;
    const resource = await Resource.create({ title, type, class_id, course_id, content_url });

    const messageMap = {
      lecture: 'New Lecture Uploaded',
      pdf: 'New Study Material Uploaded',
      quiz: 'New Quiz Available',
      announcement: 'New Announcement Posted'
    };

    await Notification.create({
      title: messageMap[type] || 'New Resource Added',
      message: `${title} has been added to your learning resources.`,
      class_id,
      course_id
    });

    return res.status(201).json(resource);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create resource', error: error.message });
  }
};
