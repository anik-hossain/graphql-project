const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.DB_CONNECTION);
        console.log(
            `MongoDB Connected: ${conn.connection.host.underline}`.cyan.bold
        );
    } catch (error) {
        console.log(`MongoDB not Connected`.red.bold.underline);
    }
};

module.exports = connectDB;
