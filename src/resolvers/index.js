import { GraphQLDateTime } from 'graphql-iso-date';

import userResolvers from './user';
import hotelResolvers from './hotel';

const customScalarResolver = {
  Date: GraphQLDateTime,
};

export default [
  customScalarResolver,
  userResolvers,
  hotelResolvers,
];
