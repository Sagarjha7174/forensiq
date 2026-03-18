const crypto = require('crypto');
const Razorpay = require('razorpay');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const ClassModel = require('../models/ClassModel');
const User = require('../models/User');
const { sendCoursePurchaseEmail } = require('../utils/mailer');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret'
});
const allowTestFreePurchase = process.env.ALLOW_TEST_FREE_PURCHASE === 'true';

/** POST /api/enroll/create-order — create Razorpay order for a paid course */
exports.createOrder = async (req, res) => {
  try {
    const { course_id } = req.body;
    const course = await Course.findByPk(course_id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (Number(course.price) === 0) {
      return res.status(400).json({ message: 'This course is free. Use /enroll/free instead.' });
    }

    const existing = await Enrollment.findOne({ where: { user_id: req.user.id, course_id } });
    if (existing) return res.status(400).json({ message: 'Already enrolled in this course' });

    const order = await razorpay.orders.create({
      amount: Math.round(Number(course.price) * 100),
      currency: 'INR',
      receipt: `enroll_${req.user.id}_${course_id}_${Date.now()}`
    });

    return res.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      course_name: course.name,
      key_id: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    return res.status(500).json({ message: 'Order creation failed', error: error.message });
  }
};

/** POST /api/enroll/verify — verify Razorpay signature and confirm enrollment */
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, course_id } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !course_id) {
      return res.status(400).json({ message: 'Missing payment verification fields' });
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ message: 'RAZORPAY_KEY_SECRET is not configured' });
    }

    const expectedSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSig !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    const course = await Course.findByPk(course_id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const [enrollment, created] = await Enrollment.findOrCreate({
      where: { user_id: req.user.id, course_id },
      defaults: {
        amount: course.price,
        payment_status: 'paid',
        razorpay_order_id,
        razorpay_payment_id
      }
    });

    if (!created) {
      await enrollment.update({
        amount: course.price,
        payment_status: 'paid',
        razorpay_order_id,
        razorpay_payment_id
      });
    }

    try {
      await sendCoursePurchaseEmail({
        to: user.email,
        fullName: `${user.first_name} ${user.last_name}`.trim(),
        courseName: course.name,
        courseDescription: course.description,
        amount: course.price,
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id
      });
    } catch (mailError) {
      console.error('Purchase email failed:', mailError.message);
    }

    return res.status(201).json({ message: 'Payment verified. Enrolled successfully.', enrollment });
  } catch (error) {
    return res.status(500).json({ message: 'Payment verification failed', error: error.message });
  }
};

/** POST /api/enroll/free — directly enroll in a free (price=0) course */
exports.enrollFree = async (req, res) => {
  try {
    const { course_id } = req.body;
    const course = await Course.findByPk(course_id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (Number(course.price) > 0 && !allowTestFreePurchase) {
      return res.status(400).json({ message: 'This is a paid course. Please complete payment.' });
    }

    const [enrollment, created] = await Enrollment.findOrCreate({
      where: { user_id: req.user.id, course_id },
      defaults: {
        amount: allowTestFreePurchase ? course.price : 0,
        payment_status: 'free'
      }
    });

    if (!created) return res.status(400).json({ message: 'Already enrolled in this course' });
    return res.status(201).json({ message: 'Enrolled in free course', enrollment });
  } catch (error) {
    return res.status(500).json({ message: 'Enrollment failed', error: error.message });
  }
};

exports.getMyCourses = async (req, res) => {
  try {
    const enrollments = await Enrollment.findAll({
      where: { user_id: req.user.id },
      include: [
        {
          model: Course,
          as: 'course',
          include: [{ model: ClassModel, as: 'classes', through: { attributes: [] } }]
        }
      ],
      order: [['id', 'DESC']]
    });

    return res.json(
      enrollments.map((item) => ({
        id: item.id,
        amount: item.amount,
        payment_status: item.payment_status,
        course: item.course
          ? { ...item.course.toJSON(), title: item.course.name, image: item.course.thumbnail }
          : null
      }))
    );
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch enrolled courses', error: error.message });
  }
};
