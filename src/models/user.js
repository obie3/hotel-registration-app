'use strict';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import isEmail from 'validator/lib/isEmail';

const userSchema = new mongoose.Schema({
  
  company_name: {
    type: String,
  },

  surname: {
    type: String,
  },

  othernames: {
    type: String,
  },

  phonenumber: {
    type: String,
  },

  company_address: {
    type: String,
  },
  email: {
    type: String,
  },

  description: {
    type: String,
  },

  password: {
    type: String,
    maxlength: 42,
  },

  role: {
    type: String,
  },

  created_at: {type: Date, default: new Date()},
  updated_at: {type: Date, default: new Date()}
}

);


userSchema.index({ email: 1}, { unique: true});

userSchema.statics.findByLogin = async function(username) {
  let user = await this.findOne({
    email: username,
  });

  // if (!user) {
  //   user = await this.findOne({ email: username });
  // }

  return user;
};

userSchema.pre('remove', function(next) {
  this.model('Product').deleteMany({ userId: this._id }, next);
});

userSchema.pre('save', async function() {
  this.password = await this.generatePasswordHash();
});

userSchema.methods.generatePasswordHash = async function() {
  const saltRounds = 10;
  return await bcrypt.hash(this.password, saltRounds);
};

userSchema.methods.validatePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
