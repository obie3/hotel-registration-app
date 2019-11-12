import { ForbiddenError } from 'apollo-server';
import { combineResolvers, skip } from 'graphql-resolvers';

export const isAuthenticated = (parent, args, { me }) =>
  me ? skip : new ForbiddenError('Login to create Hotels.');

export const isAdmin = combineResolvers(
  isAuthenticated,
  (parent, args, { me: { role } }) =>
    role === 'ADMIN'
      ? skip
      : new ForbiddenError('Not authorized as admin.'),
);

export const isHotelOwner = async (
    parent,
    { id },
    { models, me },
  ) => {
    const hotel = await models.Hotel.findById(id);

  if (hotel.userId != me.id) {
    throw new ForbiddenError('Not authenticated as owner.');
  }

  return skip;
};
