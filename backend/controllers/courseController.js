const Course = require('../models/Course');
const ClassModel = require('../models/ClassModel');
const CourseClass = require('../models/CourseClass');
const Notification = require('../models/Notification');

const withClasses = {
  include: [{ model: ClassModel, as: 'classes', through: { attributes: [] }, attributes: ['id', 'name'] }]
};

const formatCourse = (course) => ({
  ...course.toJSON(),
  title: course.name,
  image: course.thumbnail,
  class_ids: course.classes?.map((c) => c.id) || []
});

exports.getCourses = async (req, res) => {
  try {
    const include = [
      {
        model: ClassModel,
        as: 'classes',
        through: { attributes: [] },
        attributes: ['id', 'name'],
        ...(req.query.class_id ? { where: { id: req.query.class_id }, required: true } : {})
      }
    ];
    const courses = await Course.findAll({ include, order: [['id', 'ASC']] });
    return res.json(courses.map(formatCourse));
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch courses', error: error.message });
  }
};

exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id, withClasses);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    return res.json(formatCourse(course));
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch course', error: error.message });
  }
};

exports.createCourse = async (req, res) => {
  try {
    const { name, class_ids, description, price, thumbnail } = req.body;
    if (!name || !description || !class_ids?.length) {
      return res.status(400).json({ message: 'name, description, and class_ids are required' });
    }

    const course = await Course.create({ name, description, price: price || 0, thumbnail });
    const ids = (Array.isArray(class_ids) ? class_ids : [class_ids]).map(Number);
    await CourseClass.bulkCreate(ids.map((cid) => ({ course_id: course.id, class_id: cid })));

    for (const cid of ids) {
      await Notification.create({
        title: 'New Course Available',
        message: `${name} is now open for enrollment.`,
        class_id: cid,
        course_id: course.id
      });
    }

    const result = await Course.findByPk(course.id, withClasses);
    return res.status(201).json(formatCourse(result));
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create course', error: error.message });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const { class_ids, ...rest } = req.body;
    await course.update(rest);

    if (class_ids?.length) {
      const ids = (Array.isArray(class_ids) ? class_ids : [class_ids]).map(Number);
      await CourseClass.destroy({ where: { course_id: course.id } });
      await CourseClass.bulkCreate(ids.map((cid) => ({ course_id: course.id, class_id: cid })));
    }

    const result = await Course.findByPk(course.id, withClasses);
    return res.json(formatCourse(result));
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update course', error: error.message });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    await CourseClass.destroy({ where: { course_id: course.id } });
    await course.destroy();
    return res.json({ message: 'Course deleted' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete course', error: error.message });
  }
};
