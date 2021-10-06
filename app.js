require("dotenv").config();
require("./config/database").connect();
const express = require("express");

const app = express();

app.use(express.json());

const cors = require('cors');
app.use(cors({
    origin: 'http://localhost:3000'
}));

const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');

const config = process.env;

// importing user context
const Users = require("./model/user");
const Tasks = require("./model/tasks");

const auth = require("./middleware/auth");
const user = require("./model/user");
const e = require("express");
const { ObjectId } = require("bson");

app.get("/welcome", auth, (req, res) => {
  // const token =
  // req.body.token || req.query.token || req.headers["x-access-token"];
  // const decoded = jwt.verify(token, config.TOKEN_KEY);
  // console.log(decoded);
  console.log(req.user);
  res.status(200).send("Welcome 🙌 ");
});
//Create Task
app.post("/task/createTask", auth, async (req, res) => {
// Our create logic starts here
try {
  // Get user input
  const { name, description, deadline, priority, status, bucket } = req.body;

  // Validate user input
  if (!name && !priority) {
    res.status(400).send("Invalid params");
  }
  const email = req.user.email;
  console.log(email);
  await Tasks.create({
    userID: email,
    name:name,
    description: description,
    deadline: deadline,
    priority:priority,
    status: status,
    bucket: bucket
  })
    res.status(200).json();
} catch (err) {
  console.log(err);
}
});

//Read All Tasks
app.get("/task/getTasks", auth, async (req, res) => {
try {
  const userid = req.user.email;
  const tasksList = await Tasks.find({userID: userid});
  res.status(200).json(tasksList);
} catch (err) {
  console.log(err);
}
});

//Get Task based on ID
app.get("/task/getTask/:id", auth, async (req, res) => {
  try {
    console.log(req.params);
    const tasksList = await Tasks.findById(req.params.id);
    res.status(200).json(tasksList);
  } catch (err) {
    console.log(err);
  }
  });

//Update Task
app.put("/task/updateTask", auth, (req, res) => {
  // Our create logic starts here
try {
  // Get user input
  const { id, name, description, deadline, priority, status, bucket } = req.body;

  const updates = {};

  if(name)
    updates.name = name;
  if(description)
    updates.description = description;
  if(deadline)
    updates.deadline = Date(deadline);
  if(priority)
    updates.priority = priority;
  if(status)
    updates.status = status;
  if(bucket)
    updates.bucket = bucket;

  Tasks.findByIdAndUpdate(id, updates, {upsert:true},function(err, doc) {
    if(err) 
      return res.send(500, {error: err});

      return res.status(200).send("Successfully saved");
  });
} catch (err) {
  console.log(err);
}
});

//Delete Task
app.delete("/task/deleteTask", auth, async (req, res) => {
try{ 
  // const filter ={ _id: ObjectId(req.body.id), userID: req.user.email};
  // console.log(filter);
  Tasks.findByIdAndDelete( req.body.id, function(err, doc){
    if(err)
      return res.send(500, {error: err});

    res.status(200).send("Successfully Deleted");
  })
} catch (err) {
  console.log(err);
}
});

// Register
// our register logic goes here...
app.post("/register", async (req, res) => {

    // Our register logic starts here
    try {
      // Get user input
      const { first_name, last_name, email, password } = req.body;

      // Validate user input
      if (!(email && password && first_name && last_name)) {
        res.status(400).send("All input is required");
      }

      // check if user already exist
      // Validate if user exist in our database
      const oldUser = await Users.findOne({ email });

      if (oldUser) {
        return res.status(409).send("User Already Exist. Please Login");
      }

      //Encrypt user password
      encryptedPassword = await bcrypt.hash(password, 10);

      // Create user in our database
      const user = await Users.create({
        first_name,
        last_name,
        email: email.toLowerCase(), // sanitize: convert email to lowercase
        password: encryptedPassword,
      });

      // Create token
      const token = jwt.sign(
        { user_id: user._id, email },
        process.env.TOKEN_KEY,
        {
          expiresIn: "2h",
        }
      );
      // save user token
      user.token = token;

      // return new user
      res.status(201).json(user);
    } catch (err) {
      console.log(err);
    }
    // Our register logic ends here
});

// Login
app.post("/login", async (req, res) => {
// Our login logic starts here
try {
    // Get user input
    const { email, password } = req.body;

    // Validate user input
    if (!(email && password)) {
      res.status(400).send("All input is required");
    }
    // Validate if user exist in our database
    const user = await Users.findOne({ email });
    console.log(user);
    if (user && (await bcrypt.compare(password, user.password))) {
      // Create token
      const token = jwt.sign(
        { user_id: user._id, email },
        process.env.TOKEN_KEY,
        {
          expiresIn: "2h",
        }
      );

      // save user token
      user.token = token;

      // user
      res.status(200).json(user)
    }
    else
      res.status(400).send("Invalid Credentials")
  } catch (err) {
    console.log(err);
  }
  // Our register logic ends here
});

module.exports = app;