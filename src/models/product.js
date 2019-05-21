import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({

    name: {
        type: String,
    },

    manufacturer: {
        type: String,
    },

    price_per_unit: {
        type: String,
    },

    category: {
        type: String,

    },

    company_name: {
        type: String,
    },

    description: {
        type: String,
    },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
}, {
    timestamps: true,
}, );

const Product = mongoose.model('Product', productSchema);

export default Product;