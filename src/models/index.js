import mongoose from 'mongoose';
import config from '../config';
import User from './user';
import Product from './product';


const configuration = {  
  useNewUrlParser: true ,
  useCreateIndex: true,
  useFindAndModify: false,
  reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
  reconnectInterval: 500, // Reconnect every 500ms
  poolSize: 10, // Maintain up to 10 socket connections
  bufferMaxEntries: 0,
  connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
}


const connectDb = () => {
  return mongoose.connect(
    config.db.url,
    configuration,
  );
};

 //mongoose.connection.dropDatabase();


const models = { User, Product };

export { connectDb };

export default models;
