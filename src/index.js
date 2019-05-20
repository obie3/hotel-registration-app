import 'dotenv/config';
import cors from 'cors';
import morgan from 'morgan';
import http from 'http';
import jwt from 'jsonwebtoken';
import DataLoader from 'dataloader';
import express from 'express';
import config from './config';
import {ApolloServer, AuthenticationError,} from 'apollo-server-express';
import log from './utils/Logger';
import schema from './schema';
import resolvers from './resolvers';
import models, { connectDb } from './models';
import loaders from './loaders';

const app = express();
log.info(`Starting ${config.serviceName}  server`);

app.use(cors());

app.use(morgan('dev'));

const getMe = async req => {
  const token = req.headers['token'];
  console.log({token})
  console.log({req})
  if (token !== null) {
    try {
      return await jwt.verify(token, config.APP_SECRET);
    } catch (e) {
      throw new AuthenticationError(
        'Your session expired. Sign in again.',
      );
    }
  }
};

const server = new ApolloServer({
  introspection: true,
  playground: true,
  typeDefs: schema,
  resolvers,
  formatError: error => {
    // remove the internal sequelize error message
    // leave only the important validation error
    const message = error.message
      .replace('SequelizeValidationError: ', '')
      .replace('Validation error: ', '');

    return {
      ...error,
      message,
    };
  },
  context: async ({ req, connection }) => {
    if (connection) {
      return {
        models,
        loaders: {
          user: new DataLoader(keys =>
            loaders.user.batchUsers(keys, models),
          ),
        },
      };
    }

    if (req) {
      const me = await getMe(req);

      return {
        models,
        me,
        secret: config.APP_SECRET,
        loaders: {
          user: new DataLoader(keys =>
            loaders.user.batchUsers(keys, models),
          ),
        },
      };
    }
  },
});

server.applyMiddleware({ app, path: '/graphql' });

const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);

connectDb().then(async () => {
  await Promise.all([
  //  models.User.deleteMany({}),
  //  models.Product.deleteMany({}),
  ]);

  //createUsersWithMessages(new Date());
  httpServer.listen(config.port, () => {
    log.info(`Started ${config.serviceName} server on port ${config.port}.`);

  });
}).catch((error)=>
  log.error(`${error} while connecting to the DB `)
);

const createUsersWithMessages = async date => {

  const user1 = new models.User({
    email: 'admin@gmail.com',
    password: 'password',
    surname:'Dihweng',
    othernames: 'Albert',
    phonenumber: '07038602624',
    company_name:'Dihweng and Co.',
    company_address: 'nHub Nigeria',
    description: 'General contractor and dealers of all kinds of Products',
    role: 'ADMIN',
  });

  const user2 = new models.User({
    email: 'eddie@gmail.com',
    password: 'password',
    surname:'Edward',
    othernames: 'Obande',
    phonenumber: '08103727918',
    company_name:'Eddie and Co.',
    company_address: 'Rayfield Jos',
    description: 'General contractor and dealers of all kinds of Products',
  });

  const product1 = new models.Product({
    name: 'Dangote Cement',
    manufacturer: 'Dangote Cement Company',
    price_per_unit: '1200',
    category: 'Building Material',
    description: '50KG bag of Dangote portland cement',
    company_name: 'Dihweng and Co.',
    createdAt: date.setSeconds(date.getSeconds() + 1),
    userId: user1.id,
  });

  const product2 = new models.Product({
    name: 'LG Television',
    manufacturer: 'LG Electronics',
    price_per_unit: '112200',
    category: 'Office Electronics',
    description: 'LG Electronics 42\' colored television',
    company_name: 'Eddie and Co.',
    createdAt: date.setSeconds(date.getSeconds() + 1),
    userId: user2.id,
  });

  const product3 = new models.Product({
    name: 'Dangote Cement',
    manufacturer: 'Dangote Cement Company',
    price_per_unit: '1150',
    category: 'Building Material',
    description: '50KG bag of Dangote portland cement',
    company_name: 'Eddie and Co.',
    createdAt: date.setSeconds(date.getSeconds() + 1),
    userId: user2.id,
  });

  await product1.save();
  await product2.save();
  await product3.save();

  await user1.save();
  await user2.save();
};
