const mongoose = require('mongoose');

const CountryDirectorSchema = new mongoose.Schema(
    {
        countrydirector_name: {
            type: String,
            required: true,
            trim: true
        },
        country: {
            type: String,
            required: true,
            trim: true
        },
        phone: {
            type: String,
            required: true,
            trim: true
        },
        countrydirector_email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: [/.+\@.+\..+/, 'Please fill a valid email address']
        },
        countrydirector_password: {
            type: String,
            required: true,
            minlength: 6
        }
    },
    {
        collection: 'countrydirector',
        // timestamps: true // adds createdAt and updatedAt
    }
);

module.exports = mongoose.model('CountryDirector', CountryDirectorSchema);
