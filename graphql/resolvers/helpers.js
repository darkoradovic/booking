const Event = require("../../models/event");
const User = require("../../models/users");
const { dateToString } = require("../../helpers/date");
const Dataloader = require("dataloader");

const eventLoader = new Dataloader(eventIds => {
  return events(eventIds);
});

const userLoader = new Dataloader(userIds => {
  return User.find({ _id: { $in: userIds } });
});

const user = async userId => {
  try {
    const user = await userLoader.load(userId.toString());
    return {
      ...user._doc,
      id: user.id,
      createdEvents: () => eventLoader.loadMany.bind( user._doc.createdEvents) 
      //createdEvents: () => eventLoader.loadMany(user._doc.createdEvents)
    };
  } catch (error) {
    throw error;
  }
};

/* const events = eventsId => {
  return Event.find({ _id: { $in: eventsId } }).then(events => {
    return events.map(event => {
      return transformEvent(event);
    });
  });
}; */

const events = async eventIds => {
  try {
    const events = await Event.find({ _id: { $in: eventIds } });
    return events.map(event => {
      return transformEvent(event);
    });
  } catch (err) {
    throw err;
  }
};

const singleEvent = async eventId => {
  try {
    /* const event = await Event.findById(eventId); uvodimo data loader pa zamenjujemo sa ovom donjom novom */
    const event = await eventLoader.load(eventId.toString());
    return event;
  } catch (error) {
    throw error;
  }
};

const transformEvent = event => {
  return {
    ...event._doc,
    _id: event.id,
    date: dateToString(event._doc.date),
    creator: user.bind(this, event.creator)
  };
};

const transformBooking = booking => {
  return {
    ...booking._doc,
    _id: booking.id,
    user: user.bind(this, booking._doc.user),
    event: singleEvent.bind(this, booking._doc.event),
    createdAt: dateToString(booking._doc.createdAt),
    updatedAt: dateToString(booking._doc.updatedAt)
  };
};

exports.transformEvent = transformEvent;
exports.transformBooking = transformBooking;

/* exports.user = user;
exports.events = events;
exports.singleEvent = singleEvent; */
