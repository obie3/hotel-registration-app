'use strict';
import { gql } from 'apollo-server-express';

export default gql`
  extend type Query {
    products:[Product]
    product(id: ID!): Product!
  }

  extend type Mutation {
    createProduct(
      name: String!
      manufacturer: String!
      price_per_unit: String!
      category: String!
      description: String!   
    ): Product!
    
    deleteProduct(id: ID!): Boolean!
  }

  type ProductConnection {
    edges: [Product!]!
    pageInfo: PageInfo!
  }

  type PageInfo {
    hasNextPage: Boolean!
    endCursor: String!
  }

  type Product {
    id: ID!
    name: String
    manufacturer: String
    price_per_unit: String
    category: String
    company_name: String
    description: String
    createdAt: Date
    user: User
  }

  extend type Subscription {
    productCreated: ProductCreated!
  }

  type ProductCreated {
    product: Product!
  }
`;
