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
    student_country_code: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5,
    },
    student_phone_no: {
      type: String,
      required: true,
      trim: true,
      match: [/^\d+$/, 'Phone number must be digits only'],
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
    guardian_phone_no: {
      type: String,
      required: true,
      trim: true,
      match: [/^\d+$/, 'Phone number must be digits only'],
    },
  },
  {
    collection: 'student', // ⬅ plural is recommended
    // timestamps: true,
  }
);

module.exports = mongoose.model('Student', StudentSchema);