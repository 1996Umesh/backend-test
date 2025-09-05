const mongoose = require('mongoose');

const ExamPaymentSchema = new mongoose.Schema(
    {
        paid_date: {
            type: Date,
            default: Date.now // ✅ correct for payment date
        },
        paid_amount: {
            type: Number, // ✅ should be a number (amount paid)
            required: true
        },
        payment_status: {
            type: String, // ✅ should be a string (e.g. "pending", "paid", "failed")
            // enum: ["pending", "paid", "failed"], // optional but recommended
            // default: "pending"
        },
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
        collection: 'exampayment',
        timestamps: true // createdAt, updatedAt
    }
);

module.exports = mongoose.model('ExamPayment', ExamPaymentSchema);
