const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');

exports.enrollInCourse = async (req, res) => {
  try {
    const { course_id, payment_provider = 'simulated' } = req.body;
    const course = await Course.findByPk(course_id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const [enrollment, created] = await Enrollment.findOrCreate({
      where: { user_id: req.user.id, course_id },
      defaults: {
        amount: course.price,
        payment_status: payment_provider === 'razorpay' ? 'pending' : 'paid'
      }
    });

    if (!created) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    return res.status(201).json({
      message: 'Enrollment successful',
      enrollment,
      payment_mode: payment_provider
    });
  } catch (error) {
    return res.status(500).json({ message: 'Enrollment failed', error: error.message });
  }
};

exports.getMyCourses = async (req, res) => {
  try {
    const enrollments = await Enrollment.findAll({
      where: { user_id: req.user.id },
      include: [{ model: Course, as: 'course' }],
      order: [['id', 'DESC']]
    });

    return res.json(
      enrollments.map((item) => ({
        id: item.id,
        amount: item.amount,
        payment_status: item.payment_status,
        course: item.course
          ? {
              ...item.course.toJSON(),
              title: item.course.name,
              image: item.course.thumbnail
            }
          : null
      }))
    );
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch enrolled courses', error: error.message });
  }
};
