import { combineResolvers } from 'graphql-resolvers';
import pubsub, { EVENTS } from '../subscription';
import { isAuthenticated, isHotelOwner } from './authorization';

export default {
  Query: {
    hotels: async (parent, args, { models }) => {  
      try {
        return await models.Hotel.find();
      }
      catch(e) {
        console.log({e})
      } 
    },

    hotel: async (parent, { id }, { models }) => {
      return await models.Hotel.findById(id);
    },
  },

  Mutation: {
    createHotel: combineResolvers(
      isAuthenticated,
      async (parent, args , { models, me }) => {    
        console.log({me})    
        let hotel = new models.Hotel(Object.assign({}, args, {
          userId: me.id,
          //company_name: me.company_name,
        }));

        hotel = await hotel.save(); 

        if(hotel) {
          pubsub.publish(EVENTS.HOTEL.CREATED, {
            hotelCreated: { hotel },
          });
          return hotel;
        }
        //throw new Error('Something Went Wromg Please Try Again')  
      },
    ),


    updateHotel: combineResolvers(
      isAuthenticated,
      isHotelOwner,
      async (parent, args , { models }) => {
        let hotel = await models.Hotel.findOneAndUpdate(
          args.id,
          {"name" : args.name,
          "description" : args.description,
          "street_name" : args.street_name, 
          "address" : args.address,
          "category": args.category},

          {new: true},
        );
         console.log ({hotel})
        if (hotel) {
          return hotel;
        } else {
          throw new Error('Error Ocurred During Update');
        }
      },
    ),

    deleteHotel: combineResolvers(
      isAuthenticated,
      isHotelOwner,
      async (parent, { id }, { models }) => {
        const hotel = await models.Hotel.findById(id);

        if (hotel) {
          await hotel.remove();
          return true;
        } 
        else {
          return false;
        }
      },
    ),
  },

 
  Hotel: {
    user: async (hotel, args, { loaders }) => {
      return await loaders.user.load(hotel.userId);
    },
  },
  

  Subscription: {
    hotelCreated: {
      subscribe: () => pubsub.asyncIterator(EVENTS.HOTEL.CREATED),
    },
  },
};
