'use strict';
import { gql } from 'apollo-server-express';

export default gql`
  extend type Query {
    users: [User]
    user(id: ID!): User
    #me(token: String!):User
     me:User

  }

  extend type Mutation {
    signUp(
      surname: String!
      othernames: String!
      phonenumber: String!
      password: String!
      role: String
    ): Token!

    signIn(username: String!, password: String!): Token!
    updateUser(username: String!): User
    deleteUser(id:ID!): Boolean!
  }

  type Token {
    user:User
    token:String
  }

  type User {
    id: ID
    surname: String
    othernames: String
    phonenumber: String
    role: String
    hotels: [Hotel]
  }
`;
