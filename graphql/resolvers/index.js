const authResolver = require("./auth");
const eventsResolver = require("./events");
const bookingResolver = require("./booking");

const rooResolver = {
  ...authResolver,
  ...eventsResolver,
  ...bookingResolver
};

module.exports = rooResolver;
