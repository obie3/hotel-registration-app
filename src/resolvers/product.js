import { combineResolvers } from 'graphql-resolvers';
import pubsub, { EVENTS } from '../subscription';
import { isAuthenticated, isProductOwner } from './authorization';


export default {
  Query: {
    products: async (parent, args, { models }) => {  
      return await models.Product.find();
    },

    product: async (parent, { id }, { models }) => {
      return await models.Product.findById(id);
    },
  },

  Mutation: {
    createProduct: combineResolvers(
      isAuthenticated,
      async (parent, args , { models, me }) => {        
        let product = new models.Product(Object.assign({}, args, {
          userId: me.id,
          company_name: me.company_name,
        }));

        product = await product.save(); 

        pubsub.publish(EVENTS.PRODUCT.CREATED, {
          productCreated: { product },
        });

        return product;
      },
    ),

    deleteProduct: combineResolvers(
      isAuthenticated,
      isProductOwner,
      async (parent, { id }, { models }) => {
        const product = await models.Product.findById(id);

        if (product) {
          await product.remove();
          return true;
        } else {
          return false;
        }
      },
    ),
  },

 
  Product: {
    user: async (product, args, { loaders }) => {
      return await loaders.user.load(product.userId);
    },
  },

  Subscription: {
    productCreated: {
      subscribe: () => pubsub.asyncIterator(EVENTS.PRODUCT.CREATED),
    },
  },
};
