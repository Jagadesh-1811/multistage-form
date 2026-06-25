const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || process.env.MONGOURI || process.env.MONGODB_URI);
        console.log("MongoDB Connected successfully");

        // Programmatically clean up legacy username_1 index if it exists
        const collections = await mongoose.connection.db.listCollections().toArray();
        if (collections.some(col => col.name === 'users')) {
            const indexes = await mongoose.connection.db.collection('users').indexes();
            if (indexes.some(idx => idx.name === 'username_1')) {
                await mongoose.connection.db.collection('users').dropIndex('username_1');
                console.log("Dropped legacy username_1 index");
            }
        }
    } catch (error) {
        console.error("error connecting to mongodb:", error.message || error);
    }
}

module.exports = connectDB;