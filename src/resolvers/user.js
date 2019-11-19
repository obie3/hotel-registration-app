'use scrict';
import jwt from 'jsonwebtoken';
import { combineResolvers } from 'graphql-resolvers';
import { AuthenticationError, UserInputError } from 'apollo-server';
import { isAdmin, isAuthenticated } from './authorization';
import config from '../config';
import log from '../utils/Logger';

const createToken = async (user, secret, expiresIn) => {
    let { id, phonenumber, surname, role } = user;

  return jwt.sign({id, phonenumber, surname, role}, secret, {
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
      if (!me) {
        log.info(`failed to retrieve profile details`);
        return {'message':'Invalid Token, Please Signin and Retry'};
      }
      log.info(`succesfully retrieved  profile details for ${me.id}`);

      return await models.User.findById(me.id);
      // let data = await jwt.verify(args.token, config.APP_SECRET);
      // if (!data) {
      //   log.info(`failed to retrieve profile details`);
      //   return {'message':'Invalid Token, Please Signin and Retry'};
      // }
      // log.info(`succesfully retrieved  profile details for ${data.id}`);
      // return await models.User.findById(data.id);
     },
  },

  Mutation: {
    signUp: async (parent, args , { models, secret }, ) => {
      log.info(`trying to signup`);

      let user = await models.User.findOne({phonenumber: args.phonenumber});
        if(user) {
          log.info(`${args.email} is already taken`);
          throw new AuthenticationError('User Already Exist.');
        }
        // else {
        //   user = await models.User.findOne({phonenumber: args.phonenumber});
        //   if(user) {
        //     log.info(`${args.phonenumber} is already taken`);
        //     throw new AuthenticationError('Phone already Taken .');
        //   }
        // }

      
      user = await new models.User(Object.assign({}, args));
      user =  await user.save();
      log.info(`signup successful for  ${args.phonenumber}`);
      let token = await  createToken(user, secret, '365d');
      return {
        token, user
      };
      //  return await { token: createToken(user, secret, '365d') };
    },

    

    signIn: async ( parent, { username, password }, { models, secret }) => {
      const user = await models.User.findByLogin(username);
      if (!user) {
        log.info(`invalid login credentials by ${username}`);
        throw new UserInputError(
          'Invalid username/password.',
        );
      }

      const isValid = await user.validatePassword(password);
      if (!isValid) {
        log.info(`invalid login password by ${username}`);
        throw new AuthenticationError('Invalid username/password.');
      }
      log.info(` login successful for ${username}`);
      let token = await  createToken(user, secret, '365d');
      return await {
        token, user
      };
    },

    updateUser: combineResolvers(
      isAuthenticated,
      async (parent, args, { models, me }) => {
        return await models.User.findByIdAndUpdate(
          me.id,
          { args },
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
        } 
        else {
          return false;
        }
      },
    ),
  },

  User: {
    hotels: async (user, args, { models }) => {
      return await models.Hotel.find({
        userId: user.id,
      });
    },
  },
};
