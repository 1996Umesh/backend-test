const mongoose = require('mongoose');

const SubjectSchema = new mongoose.Schema(
  {
    subject_code: { type: String, required: true },
    subject_title: { type: String, required: true },
    countrydirector_id: { type: mongoose.Schema.Types.ObjectId, ref: "CountryDirector" },
  },
  {
    collection: 'subject', // force exact collection name
  }
);

// ✅ Prevent OverwriteModelError in serverless
module.exports = mongoose.models.Subject || mongoose.model('Subject', SubjectSchema);
