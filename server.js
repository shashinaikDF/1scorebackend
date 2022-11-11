const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");

const users = require('./routes/api/users');



const path = require("path");
const app = express();

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// DB Config
const db = require("./config/keys").mongoURI;

// Connect to MongoDB
mongoose
  .connect(db,{ useNewUrlParser: true})
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));


app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,HEAD,DELETE,OPTIONS,POST,PUT"
  );
  next();
});

app.use(passport.initialize());


require('./config/passport')(passport);



//Routes
app.use('/api/users', users);


// app.use(express.static('client/build'));

//  app.get('*', (request, response) => {
//   response.sendFile(path.resolve(__dirname, './client','build', 'index.html'));
// });


const port = process.env.PORT || 5000;




app.listen(port, () => console.log(`Server running on port ${port}`));
