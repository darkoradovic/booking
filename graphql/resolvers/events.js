const Event = require("../../models/event");
const { transformEvent } = require("./helpers");

module.exports = {
  events: () => {
    return Event.find().then(events => {
      return events.map(event => {
        return transformEvent(event);
      });
    });
  },

  createEvent: (args, req) => {
    if(!req.isAuth){
      throw new Error('Not authenticated')
    }
    const event = new Event({
      title: args.eventInput.title,
      description: args.eventInput.description,
      price: args.eventInput.price,
      date: new Date(),
      creator: req.userId
    });
    let createdEvent;
    return event
      .save()
      .then(result => {
        createdEvent = transformEvent(result);
        return User.findById(req.userId);
      })
      .then(user => {
        if (!user) {
          throw new Error("User not found.");
        }
        //taj event pushujemo kod tog usera
        user.createdEvents.push(event);
        return user.save();
      })
      .then(result => {
        return createdEvent;
      })
      .catch(err => {
        console.log(err);
        throw err;
      });
  }
};
