const mongoose = require('mongoose');

const StudentExamSchema = new mongoose.Schema(
    {
        exam_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Exam',
            required: true
        },
        student_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student',
            required: true
        }
    },
    {
        collection: 'studentexam',
        // timestamps: true // createdAt, updatedAt
    }
);

module.exports = mongoose.model('StudentExam', StudentExamSchema);
