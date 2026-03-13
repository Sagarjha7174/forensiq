const Course = require('../models/Course');
const Notification = require('../models/Notification');

exports.getCourses = async (req, res) => {
  try {
    const classId = req.query.class_id;
    const where = {};
    if (classId) {
      where.class_id = classId;
    }

    const courses = await Course.findAll({ where, order: [['id', 'ASC']] });
    return res.json(
      courses.map((course) => ({
        ...course.toJSON(),
        title: course.name,
        image: course.thumbnail
      }))
    );
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch courses', error: error.message });
  }
};

exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    return res.json({
      ...course.toJSON(),
      title: course.name,
      image: course.thumbnail
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch course', error: error.message });
  }
};

exports.createCourse = async (req, res) => {
  try {
    const { name, class_id, description, price, thumbnail } = req.body;
    const course = await Course.create({ name, class_id, description, price, thumbnail });

    await Notification.create({
      title: 'New Course Available',
      message: `${name} is now open for enrollment.`,
      class_id,
      course_id: course.id
    });

    return res.status(201).json(course);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create course', error: error.message });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    await course.update(req.body);
    return res.json(course);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update course', error: error.message });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    await course.destroy();
    return res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete course', error: error.message });
  }
};
