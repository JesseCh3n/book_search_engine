
const { User } = require('../models');
const { signToken, AuthenticationError } = require('../utils/auth');

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        // return User.findOne({ _id: context.user._id })
        // .select('-__v -password');
        // returns everything BUT password
        const userInfo = await User.findOne({ _id: context.user._id }).select('-__v -password');

        return userInfo;
      }
      throw AuthenticationError;
    },
  },

  Mutation: {
    addUser: async (parent, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);
      return { token, user };
    },
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw AuthenticationError;
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw AuthenticationError;
      }

      const token = signToken(user);

      return { token, user };
    },
    saveBook: async (parent, { bookData }, context) => {
      console.log("savebook-0  ", context);
      if (context.user) {
        console.log("savebook-1  ", context.user);
        // return User.findOneAndUpdate(
        //   { _id: context.user._id },
        //   { $addToSet: { savedBooks: { book: bookData } } },
        //   { new: true, runValidators: true }
        // );
        const changedUser = await User.findByIdAndUpdate(
          { _id: context.user._id },
          { $push: { savedBooks: bookData } },
          { new: true }
        );
        console.log("savebook-2  ", context.user);
        console.log("changeduser-1  ", changedUser);
        return changedUser;
      }
      throw new AuthenticationError("Please login");
    },
    removeBook: async (parent, { bookId }, context) => {
      // return User.findOneAndUpdate(
      //   { _id: context.user._id },
      //   { $pull: { saveBookss: { _id: bookId } } },
      //   { new: true }
      // );
      const changedUser = await User.findByIdAndUpdate(
        { _id: context.user._id },
        { $pull: { saveBookss: { _id: bookId } } },
        { new: true }
      );

      return changedUser;
    },
  },
};

module.exports = resolvers;
