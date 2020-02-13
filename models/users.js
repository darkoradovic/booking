const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  //ovo je array sa eventsima za svakog usera posebno
  createdEvents: [
    {
      type: Schema.Types.ObjectId,
      ref: "Event" //iz event modela ime
    }
  ]
});

module.exports = mongoose.model("User", userSchema);
