const mongoose = require('mongoose');

const CountryDirectorSchema = new mongoose.Schema(
    {
        countrydirector_id: { type: String, required: true },
        country: { type: String, required: true },
        countrydirector_name: { type: String, required: true },
        // phone: { type: String, required: true },
        countrydirector_email: { type: String, required: true, unique: true },
        countrydirector_password: { type: String, required: true }
    },
    {
        collection: 'countrydirector',
        // timestamps: true // adds createdAt and updatedAt
    }
);

module.exports = mongoose.model('CountryDirector', CountryDirectorSchema);
