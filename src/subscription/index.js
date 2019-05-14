import { PubSub } from 'apollo-server';

import * as PRODUCT_EVENTS from './product';

export const EVENTS = {
  PRODUCT: PRODUCT_EVENTS,
};

export default new PubSub();
