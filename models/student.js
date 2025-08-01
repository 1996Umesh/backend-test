const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema(
  {
    student_email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/.+\@.+\..+/, 'Please enter a valid email address'],
    },
    student_password: {
      type: String,
      required: true,
      minlength: 6,
    },
    student_name: {
      type: String,
      required: true,
      trim: true,
    },
    student_country: {
      type: String,
      required: true,
      trim: true,
    },
    student_phone: {
      type: String,
      required: true,
      trim: true,
    },
    student_address: {
      type: String,
      required: true,
      trim: true,
    },
    date_of_birth: {
      type: String, // You can change this to Date if you prefer
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: true,
    },
    guardian_name: {
      type: String,
      required: true,
      trim: true,
    },
    guardian_address: {
      type: String,
      required: true,
      trim: true,
    },
    guardian_phone: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    collection: 'student', // ⬅ plural is recommended
    // timestamps: true,
  }
);

module.exports = mongoose.model('Student', StudentSchema);