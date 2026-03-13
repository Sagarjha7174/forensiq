const Workshop = require('../models/Workshop');

exports.getWorkshops = async (req, res) => {
  try {
    const workshops = await Workshop.findAll({ order: [['date', 'ASC']] });
    return res.json(workshops);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch workshops', error: error.message });
  }
};

exports.createWorkshop = async (req, res) => {
  try {
    const { title, description, image, date } = req.body;
    const workshop = await Workshop.create({ title, description, image, date });
    return res.status(201).json(workshop);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create workshop', error: error.message });
  }
};
