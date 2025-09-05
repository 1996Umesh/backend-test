const mongoose = require('mongoose');

const ExaminerSchema = new mongoose.Schema(
    {
        examiner_id: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        examiner_name: {
            type: String,
            required: true,
            trim: true
        },
        examiner_email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: [/.+\@.+\..+/, 'Please enter a valid email address']
        },
        examiner_password: {
            type: String,
            required: true,
            minlength: 6
        },
        countrydirector_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'CountryDirector', // 🔁 Who assigned this countrydirector
        },
        subject_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Subject', // 🔁 Reference to a Subject schema (if you have one)
            required: true
        }
    },
    {
        collection: 'examiner',
        // timestamps: true // Adds createdAt, updatedAt
    }
);

module.exports = mongoose.model('Examiner', ExaminerSchema);
