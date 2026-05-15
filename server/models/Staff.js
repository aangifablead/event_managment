const mongoose = require('mongoose')
const Counter = require('./Counter')

const StaffSchema = new mongoose.Schema({
    staffId: { type: Number },
    name: { type: String, require: true, trim: true },
    email: { type: String, require: true, trim: true ,unique: true},
    role: { type: String, default: 'User' },
    status: { type: String, default: 'PENDING' },
    adminId: {                                      //to sync data with that particular user
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true })

//Auto-increment

StaffSchema.pre('save', async function () {
    if (this.isNew) {
        try {
            const counter = await Counter.findOneAndUpdate(
                { id: 'staff_seq' },
                { $inc: { seq: 1 } },
                { new: true, upsert: true }

            )
            this.staffId = counter.seq
        } catch (error) {
            console.error("Counter Error:", error);
            throw error;
        }
    }
})
module.exports = mongoose.model('Staff', StaffSchema);