const mongoose = require('mongoose');

const SuperadminSchema = new mongoose.Schema(
  {
    superadmin_email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/.+\@.+\..+/, 'Please fill a valid email address']
    },
    superadmin_password: {
      type: String,
      required: true,
      minlength: 6
    }
  },
  {
    collection: 'superadmin', // 👈 You can change this name if needed
    // timestamps: true           // 👈 Adds createdAt and updatedAt fields
  }
);

module.exports = mongoose.model('Superadmin', SuperadminSchema);
