import { PubSub } from 'apollo-server';

import * as HOTEL_EVENTS from './hotel';

export const EVENTS = {
  HOTEL: HOTEL_EVENTS,
};

export default new PubSub();
