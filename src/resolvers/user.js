'use scrict';
import jwt from 'jsonwebtoken';
import { combineResolvers } from 'graphql-resolvers';
import { AuthenticationError, UserInputError } from 'apollo-server';
import { isAdmin, isAuthenticated } from './authorization';
import config from '../config';
import log from '../utils/Logger';

const createToken = async (user, secret, expiresIn) => {
  const { id, phonenumber, company_name, role } = user;
  return await jwt.sign({id, phonenumber,  company_name, role}, secret, {
    expiresIn,
  });
};

export default {
  Query: {
    users: async (parent, args, { models }) => {
      log.info(`Searched for all users`);
      return await models.User.find();
    },
    user: async (parent, { id }, { models }) => {
      log.info(`Searched for profile with id: ${id}`);
      return await models.User.findById(id);
    },
    me: async (parent, args, { models, me }) => {
       let data = await jwt.verify(args.token, config.APP_SECRET);
      // if (!me) {
      //   log.info(`failed to retrieve profile details`);
      //   return {'message':'Invalid Token, Please Signin and Retry'};
      // }
      // log.info(`succesfully retrieved  profile details for ${me.id}`);

      // return await models.User.findById(me.id);
      if (!data) {
        log.info(`failed to retrieve profile details`);
        return {'message':'Invalid Token, Please Signin and Retry'};
      }
      log.info(`succesfully retrieved  profile details for ${data.id}`);
      return await models.User.findById(data.id);
     },
  },

  Mutation: {
    signUp: async (parent, args , { models, secret }, ) => {
      log.info(`trying to signup`);
      console.log({args})
      let user = new models.User(Object.assign({}, args));
      user = user.save();
      log.info(`signup successful for  ${args.phonenumber}`);
      return { token: createToken(user, secret, '365d') };
    },

    

    signIn: async (
      parent,
      { username, password },
      { models, secret },
    ) => {
      const user = await models.User.findByLogin(username);
      if (!user) {
        log.info(`invalid login credentials by ${username}`);
        throw new UserInputError(
          'No user found with this login credentials.',
        );
      }

      const isValid = await user.validatePassword(password);
      if (!isValid) {
        log.info(`invalid login password by ${username}`);
        throw new AuthenticationError('Invalid password.');
      }
      log.info(` login successful for ${username}`);
      return { token: createToken(user, secret, '365d')};
    },

    updateUser: combineResolvers(
      isAuthenticated,
      async (parent, { username }, { models, me }) => {
        return await models.User.findByIdAndUpdate(
          me.id,
          { username },
          { new: true },
        );
      },
    ),

    deleteUser: combineResolvers(
      isAdmin,
      async (parent, { id }, { models }) => {
        const user = await models.User.findById(id);

        if (user) {
          await user.remove();
          return true;
        } else {
          return false;
        }
      },
    ),
  },

  User: {
    products: async (user, args, { models }) => {
      return await models.Product.find({
        userId: user.id,
      });
    },
  },
};
