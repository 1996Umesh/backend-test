const mongoose = require('mongoose');

const ExamSchema = new mongoose.Schema({
  exam_title: {
    type: String,
    required: true,
    trim: true
  },
  exam_description: {
    type: String,
    required: true
  },
  exam_fee: {
    type: Number,
    required: true
  },
  exam_date: {
    type: Date,
    required: true
  },
  exam_day: {
    type: String,
    required: true
  },
  exam_start_time: {
    type: String,
    required: true
  },
  exam_end_time: {
    type: String,
    required: true
  },
  exam_time_duration: {
    type: Number,
    required: true
  },
  examiner_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Examiner',
    required: true
  },
  subject_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  country: {
    type: String,
    required: true
  }
},
  {
    collection: 'exams',
    // timestamps: true // Adds createdAt, updatedAt
  });

module.exports = mongoose.model('Exam', ExamSchema);
