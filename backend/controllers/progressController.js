const LectureProgress = require('../models/LectureProgress');
const Resource = require('../models/Resource');

exports.markLectureCompleted = async (req, res) => {
  try {
    const { resource_id } = req.body;
    const resource = await Resource.findByPk(resource_id);

    if (!resource || resource.type !== 'lecture') {
      return res.status(404).json({ message: 'Lecture not found' });
    }

    const [progress] = await LectureProgress.findOrCreate({
      where: { user_id: req.user.id, resource_id },
      defaults: { completed: true }
    });

    if (!progress.completed) {
      await progress.update({ completed: true });
    }

    return res.json({ message: 'Lecture marked as completed' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update progress', error: error.message });
  }
};

exports.getLectureProgress = async (req, res) => {
  try {
    const rows = await LectureProgress.findAll({ where: { user_id: req.user.id } });
    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch progress', error: error.message });
  }
};
