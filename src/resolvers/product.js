import { combineResolvers } from 'graphql-resolvers';
import pubsub, { EVENTS } from '../subscription';
import { isAuthenticated, isProductOwner } from './authorization';

export default {
  Query: {
    products: async (parent, args, { models }) => {  
      try {
        return await models.Product.find();
      }
      catch(e) {
        console.log({e})
      } 
    },

    product: async (parent, { id }, { models }) => {
      return await models.Product.findById(id);
    },
  },

  Mutation: {
    createProduct: combineResolvers(
      isAuthenticated,
      async (parent, args , { models, me }) => {    
        console.log({me})    
        let product = new models.Product(Object.assign({}, args, {
          userId: me.id,
          company_name: me.company_name,
        }));

        product = await product.save(); 

        if(product) {
          pubsub.publish(EVENTS.PRODUCT.CREATED, {
            productCreated: { product },
          });
          return product;
        }
        //throw new Error('Something Went Wromg Please Try Again')  
      },
    ),


    updateProduct: combineResolvers(
      isAuthenticated,
      isProductOwner,
      async (parent, args , { models }) => {
        let product = await models.Product.findOneAndUpdate(
          args.id,
          {"name" : args.name,
          "description" : args.description,
          "price_per_unit" : args.price_per_unit, 
          "manufacturer" : args.manufacturer,
          "category": args.category},

          {new: true},
        );
         console.log ({product})
        if (product) {
          return product;
        } else {
          throw new Error('Error Ocurred During Update');
        }
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
