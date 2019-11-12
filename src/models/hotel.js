import mongoose from 'mongoose';

const hotelSchema = new mongoose.Schema({

    name: {
        type: String,
    },

    address: {
        type: String,
    },

    phone_number: {
        type: String,
    },

    description: {
        type: String,
    },

    street_name: {
        type: String,
    },

    category: {
        type: String,
    },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
}, {
    timestamps: true,
}, );

const Hotel = mongoose.model('Hotel', hotelSchema);

export default Hotel;