'use strict';
import { gql } from 'apollo-server-express';

export default gql`
  extend type Query {
    users: [User]
    user(id: ID!): User
    me(token: String!):User
    # me:User

  }

  extend type Mutation {
    signUp(
      company_name: String!
      surname: String!
      othernames: String!
      phonenumber: String!
      company_address: String!
      email: String
      description: String!
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
    company_name: String
    surname: String
    othernames: String
    phonenumber: String
    company_address: String
    email: String
    description: String
    role: String
    products: [Product]
  }
`;
