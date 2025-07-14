const mongoose = require('mongoose');

const SubjectSchema = new mongoose.Schema(
    {
        subject_name: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        countrydirector_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'CountryDirector', // 🔁 Who assigned this countrydirector
        }
    },
    {
        collection: 'subject',
        // timestamps: true // createdAt, updatedAt
    }
);

module.exports = mongoose.model('Subject', SubjectSchema);
