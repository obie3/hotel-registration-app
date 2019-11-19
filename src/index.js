import 'dotenv/config';
import cors from 'cors';
import morgan from 'morgan';
import http from 'http';
import jwt from 'jsonwebtoken';
import DataLoader from 'dataloader';
import express from 'express';
import config from './config';
import {ApolloServer, AuthenticationError} from 'apollo-server-express';
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
  if (token) {
    try {
      return jwt.verify(token, config.APP_SECRET);
    } 
    catch (e) {
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
  // await Promise.all([
  //   models.User.deleteMany({}),
  //   models.Product.deleteMany({}),
  // ]);

 // createUsersWithMessages(new Date());
  httpServer.listen(config.port, () => {
    log.info(`Started ${config.serviceName} server on port ${config.port}.`);
  });
}).catch((error)=>
  log.error(`${error} while connecting to the DB `)
);




