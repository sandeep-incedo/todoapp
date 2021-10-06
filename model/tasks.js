const mongoose = require("mongoose");

const tasksSchema = new mongoose.Schema({
  userID: { type: String, unique:false },
  name: { type: String},
  description : { type: String, default: null },
  deadline: {type: Date},
  status: {type:Boolean},
  priority: {type: String},
  bucketID: {type: String, default: null}
});

module.exports = mongoose.model("tasks", tasksSchema);