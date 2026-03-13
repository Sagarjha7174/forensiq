const ClassModel = require('../models/ClassModel');

exports.getClasses = async (req, res) => {
  try {
    const classes = await ClassModel.findAll({ order: [['id', 'ASC']] });
    return res.json(classes);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch classes', error: error.message });
  }
};

exports.createClass = async (req, res) => {
  try {
    const classRow = await ClassModel.create({ name: req.body.name });
    return res.status(201).json(classRow);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create class', error: error.message });
  }
};
