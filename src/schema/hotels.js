'use strict';
import { gql } from 'apollo-server-express';

export default gql`
  extend type Query {
    hotels:[Hotel]
    hotel(id: ID!): Hotel!
  }

  extend type Mutation {
    createHotel(
      name: String!
      address: String!
      phone_number: String!
      street_name: String!
      description: String!   
      category: String!

    ): Hotel!
    
    updateHotel(
      id: ID!
      name: String!
      address: String!
      phone_number: String!
      street_name: String!
      description: String!  
      category: String!

    ): Hotel!

    deleteHotel(id: ID!): Boolean!

  }

  type HotelConnection {
    edges: [Hotel!]!
    pageInfo: PageInfo!
  }

  type PageInfo {
    hasNextPage: Boolean!
    endCursor: String!
  }

  type Hotel {
    id: ID!
    name: String!
    address: String!
    phone_number: String!
    street_name: String!
    description: String!  
    category: String
    createdAt: Date
    user: User
  }

  extend type Subscription {
    hotelCreated: HotelCreated!
  }

  type HotelCreated {
    hotel: Hotel!
  }
`;
