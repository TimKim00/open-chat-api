const mongoose = require('mongoose');

process.env.NODE_ENV === 'test' ? require('dotenv').config({ path: '.env.test' }) : require('dotenv').config({ path: '.env' });

const connectDB = async () => {
  try {

    mongoose.connection.on('error', err => {
      console.log('Connection error:', err);
    });

    const conn = await mongoose.connect(process.env.DATABASE_URL, {
      useNewUrlParser: true, // use new connection string parser
      useUnifiedTopology: true, // use new server discovery process
      retryWrites: true, // retry failed writes to MongoDB
      w: 'majority' // use write concern majority for acknolwedged writes
    });

    // Check connection state
    if (mongoose.connection.readyState !== 1) {
      throw 'Connection failed!';
    }

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

connectDB();

module.exports = mongoose;
