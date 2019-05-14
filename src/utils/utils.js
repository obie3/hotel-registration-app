'use strict';
import moment from 'moment';

export function currentAge(dob) {
  let now = moment();
   let newDob = moment(dob);
   return now.diff(newDob, 'weeks');
} 
