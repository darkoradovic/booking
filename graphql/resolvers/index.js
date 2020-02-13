const bcrypt = require("bcryptjs");

const Event = require("../../models/event");
const User = require("../../models/users");

const user = userId => {
  return User.findById(userId).then(user => {
    return {
      ...user._doc,
      id: user.id,
      createdEvents: events.bind(this, user._doc.createdEvents)
    };
  });
};

const events = eventsId => {
  return Event.find({ _id: { $in: eventsId } }).then(events => {
    return events.map(event => {
      return {
        ...event._doc,
        _id: event.id,
        date: new Date(event._doc.date).toISOString(),
        creator: user.bind(this, event.creator)
      };
    });
  });
};

module.exports = {
  events: () => {
    return Event.find().then(events => {
      return events.map(event => {
        return {
          ...event._doc,
          _id: event.id,
          date: new Date(event._doc.date).toISOString(),
          creator: user.bind(this, event._doc.creator) //user function from above
        };
      });
    });
  },
  createEvent: args => {
    const event = new Event({
      title: args.eventInput.title,
      description: args.eventInput.description,
      price: args.eventInput.price,
      date: new Date(),
      creator: "5e43e920f1fe912aa034a3ba"
    });
    let createdEvent;
    return event
      .save()
      .then(result => {
        createdEvent = {
          ...result._doc,
          _id: result._doc._id.toString(),
          date: new Date(event._doc.date).toISOString(),
          creator: user.bind(this, result._doc.creator)
        };
        return User.findById("5e43e920f1fe912aa034a3ba");
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
  },
  createUser: args => {
    return User.findOne({ email: args.userInput.email })
      .then(user => {
        //proveravamo da li postoji user sa tom email adresom
        if (user) {
          throw new Error("User exists already");
        }
        return bcrypt.hash(args.userInput.password, 12);
      })
      .then(hashedPassword => {
        const user = new User({
          email: args.userInput.email,
          password: hashedPassword
        });
        return user.save();
      })
      .then(result => {
        //password stavljamo na null jer nam nije potrebno da je vracamo
        return { ...result._doc, password: null, _id: result.id };
      });
  }
};
