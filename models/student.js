const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema(
  {
    student_name: { type: String, required: true, trim: true },
    student_email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/.+\@.+\..+/, 'Please enter a valid email address'],
    },
    student_password: { type: String, required: true },

    // optional fields
    student_name_in_certificate: { type: String, default: null },
    student_id_type: { type: String, default: null },
    student_id: { type: String, default: null },
    gender: { type: String, default: null },
    student_address: { type: String, default: null },
    student_phone_no: { type: String, default: null },
    guardian_name: { type: String, default: null },
    guardian_phone_no: { type: String, default: null },
  },
  {
    collection: 'student', // ⬅ plural is recommended
    // timestamps: true,
  }
);

module.exports = mongoose.model('Student', StudentSchema);