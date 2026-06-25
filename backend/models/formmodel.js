const mongoose = require('mongoose');

const formProgressSchema = new mongoose.Schema({
    // Links this form draft directly to the registered user
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true,
        unique: true // Ensures one active draft per user
    },
    // Tracks where the user left off (1, 2, 3, or 4)
    currentStage: { 
        type: Number, 
        default: 1 
    },
    // Stage 1: Personal Information
    personalInfo: {
        name: { type: String },
        email: { type: String },
        phone: { type: String },
        dob: { type: String },
        address: { type: String },
        govtIdFile: {
            filename: { type: String },
            originalName: { type: String },
            path: { type: String },
            size: { type: Number }
        }
    },
    // Stage 2: Educational Details
    educationalDetails: {
        qualification: { type: String },
        institution: { type: String },
        course: { type: String },
        year: { type: String },
        grade: { type: String },
        certificateFile: {
            filename: { type: String },
            originalName: { type: String },
            path: { type: String },
            size: { type: Number }
        }
    },
    // Stage 3: Payment Details
    paymentDetails: {
        amount: { type: Number },
        currency: { type: String, default: 'USD' },
        status: { type: String },
        transactionId: { type: String },
        paymentMethod: { type: String },
        dateTime: { type: Date }
    },
    // Flips to true when the user finishes all stages
    isComplete: { 
        type: Boolean, 
        default: false 
    }
}, { 
    timestamps: true 
});

module.exports = mongoose.model('FormProgress', formProgressSchema);
