const express = require("express");
const router = express.Router();
//const gravatar = require('gravatar');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const passport = require("passport");

var nodemailer = require("nodemailer");
const path = require("path");

// Load Input Validation
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");
const validateUserInput = require("../../validation/user");
//const validateResetPasswordInput = require('../../validation/resetpassword');
// Load User model
const User = require("../../models/User");

// @route   GET api/users/test
// @desc    Tests users route
// @access  Public
router.get("/test", (req, res) => res.json({ msg: "Users Works" }));

// @route   POST api/users/register
// @desc    Register user
// @access  Public
router.post("/register", (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);

  // Check Validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  User.findOne({ email: req.body.email }).then((user) => {
    if (user) {
      errors.email = "Email already exists";

      return res.status(400).json(errors);
    } else {
      const newUser = new User({
        fullname: req.body.fullname,
        email: req.body.email,

        password: req.body.password,
        phone: req.body.phone,
        company: req.body.company,
        status: req.body.status,
      });

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then((user) => res.json(user))
            .catch((err) => console.log(err));
        });
      });
    }
  });
});

// @route   GET api/users/login
// @desc    Login User / Returning JWT Token
// @access  Public
router.post("/login", (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);

  // Check Validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const email = req.body.email;
  const password = req.body.password;

  // Find user by email
  User.findOne({ email }).then((user) => {
    // Check for user
    if (!user) {
      errors.email = "User not found";
      return res.status(404).json(errors);
    }

    // Check Password
    bcrypt.compare(password, user.password).then((isMatch) => {
      if (isMatch) {
        // User Matched
        const payload = {
          id: user.id,
          fullname: user.fullname,
          email: user.email,
          phone: user.phone,
          company: user.company,
          status: user.status,
        }; // Create JWT Payload

        // Sign Token
        jwt.sign(
          payload,
          keys.secretOrKey,
          //{ expiresIn: 604800 },
          (err, token) => {
            res.json({
              success: true,
              token: "Bearer " + token,
            });
          }
        );
      } else {
        errors.password = "Password incorrect";
        return res.status(400).json(errors);
      }
    });
  });
});

// @route   GET api/users/current
// @desc    Return current user
// @access  Private
router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json({
      id: req.user.id,

      fullname: req.user.fullname,
      email: req.user.email,
      phone: req.user.phone,
      company: req.user.company,

      status: req.user.status,
    });
  }
);

// @route   GET api/user/:user_id
// @desc    Get user by user ID
// @access  Public

router.get("/:id", (req, res) => {
  const errors = {};

  User.findById(req.params.id)
    .populate("user", ["fullname", "email"])
    .then((user) => {
      if (!user) {
        errors.noprofile = "There is no profile for this user";
        res.status(404).json(errors);
        rrrrrrr;
      }

      res.json(user);
    })
    .catch((err) =>
      res.status(404).json({ profile: "There is no profile for this user" })
    );
});

router.get("/email/:email", (req, res) => {
  const errors = {};

  User.find({ email: req.params.email })
    // .populate('user', ['name', 'email','username'])
    .then((user) => {
      if (!user) {
        errors.noprofile = "There is no profile for this user";
        res.status(404).json(errors);
      }

      res.json(user);
    })
    .catch((err) =>
      res.status(404).json({ profile: "There is no profile for this user" })
    );
});

// @route   GET api/users/edit/:id
// @desc    Edit user by id
// @access  Public
router.put(
  "/edit/:id",

  (req, res) => {
    // const { errors, isValid } = validateUserInput(req.body);

    // // Check Validation
    // if (!isValid) {
    //   return res.status(400).json(errors);
    // }

    // Get fields
    const profileFields = {};
    profileFields.user = req.params.id;
    if (req.body.fullname) profileFields.fullname = req.body.fullname;

    if (req.body.phone) profileFields.phone = req.body.phone;

    if (req.body.email) profileFields.email = req.body.email;

    if (req.body.company) profileFields.city = req.body.company;

    // res.send(profileFields.hobbies);
    // res.send(req.body.handle);

    User.findById(req.params.id).then((user) => {
      if (user) {
        // // Check if handle exists
        // User.findOne({ email: profileFields.email }).then(user => {
        //   if (user) {
        //     errors.email = 'That Email already exists';
        //     res.status(400).json(errors);
        //   }

        // });
        // console.log(user);

        // Update
        User.findOneAndUpdate(
          { _id: req.params.id },
          { $set: profileFields },
          { new: true }
        ).then((user) => res.json(user));
      } else {
        // Create
        res.send("No user found");
      }
    });
  }
);

// @route   GET api/users/
// @desc    Return all users
// @access  Private

router.get("/", (req, res) => {
  User.find()
    .sort({ date: -1 })
    .then((users) => res.json(users))
    .catch((err) => res.status(404).json({ nopostsfound: "No users found" }));
});

// @route   DELETE api/users/:id
// @desc    Delete user
// @access  Private
router.delete(
  "/:id",

  (req, res) => {
    User.findById(req.params.id)
      .then((user) => {
        // Delete
        user.remove().then(() => res.json({ success: true }));
      })
      .catch((err) => res.status(404).json({ usernotfound: "No user found" }));
  }
);

router.post("/reset_password_test/", (req, res) => {
  var transporter = nodemailer.createTransport({
    host: "smtp.office365.com",
    port: 587,
    secure: false, // true for 465, false for other ports

    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
    tls: {
      ciphers: "SSLv3",
    },
  });

  var mailOptions = {
    from: process.env.SMTP_USER,
    to: `shashikant.n@decisionfoundry.com`,
    subject: "Please reset your password",
    text: `
       Hello 

       Please reset your password by clicking the link below


       https://demo.1score.io/new_password/token/

       

       Warm Regards,
       1Score Team
      `,
  };

  transporter.verify((err, success) => {
    if (err) {
      console.error(err);
    } else {
      console.log("Your config is correct", success);
    }
  });

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
});

// @route   GET api/users/reset_password/
// @desc    Submit User email / Returning JWT Token
// @access  Public
router.post("/reset_password/", (req, res) => {
  // const { errors, isValid } = validateResetPasswordInput(req.body);

  // // Check Validation
  // if (!isValid) {
  //   return res.status(400).json(errors);
  // }

  const email = req.body.email;

  // Find user by email
  User.findOne({ email }).then((user) => {
    // Check for user
    // if (!user) {
    //   //errors.email = 'User not found';
    //   return res.status(404).json();
    // }

    // User Matched
    const payload = {
      id: user.id,
      fullname: user.fullname,
      email: user.email,
      company: user.company,
      status: user.status,
    };
    // Create JWT Payload // Create JWT Payload

    // Sign Token
    jwt.sign(
      payload,
      keys.secretOrKey,
      //{ expiresIn: 604800 },
      (err, token) => {
        res.json({
          success: true,
          token: token,
        });

        console.log(token);

        console.log(payload.fullname);

        var transporter = nodemailer.createTransport({
          host: "smtp.office365.com",
          port: 587,
          secure: false, // true for 465, false for other ports

          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
          },
          tls: {
            ciphers: "SSLv3",
          },
        });

        var mailOptions = {
          from: process.env.SMTP_USER,
          to: `${payload.email}`,
          subject: "Please reset your password",
          text: `
                 Hello ${payload.fullname},

                 Please reset your password by clicking the link below


                 https://demo.1score.io/new_password/token/${token}

                 

                 Warm Regards,
                 1Score Team
                `,
        };

        transporter.verify((err, success) => {
          if (err) {
            console.error(err);
          } else {
            console.log("Your config is correct", success);
          }
        });

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.log(error);
          } else {
            console.log("Email sent: " + info.response);
          }
        });
      }
    );
  });
});

// @route   GET api/users/new_password/
// @desc    Submit User email / Returning JWT Token
// @access  Public
router.get("/new_password/token/:token", (req, res) => {
  var decoded = jwt.decode(req.params.token);

  console.log(decoded.id); // bar

  User.findById(decoded.id)
    .populate("user", ["fullname", "email"])
    .then((user) => {
      if (!user) {
        errors.noprofile = "There is no profile for this user";
        res.status(404).json(errors);
      }

      res.json(user);
      console.log(user);
    })
    .catch((err) =>
      res.status(404).json({ profile: "There is no profile for this user" })
    );
});

// @route   GET api/users/edit/:id
// @desc    Edit user by id
// @access  Public
router.post(
  "/update_password/",

  (req, res) => {
    // Get fields
    const profileFields = {};
    if (req.body.id) profileFields.id = req.body.id;
    if (req.body.password) profileFields.password = req.body.password;
    // if (req.body.name) profileFields.name = req.body.name;
    // if (req.body.email) profileFields.email = req.body.email;

    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(req.body.password, salt, (err, hash) => {
        profileFields.password = hash;
        console.log(`New Password:${JSON.stringify(profileFields)}`);
        console.log(`New Password 1:${profileFields.password}`);

        User.findById(profileFields.id).then((user) => {
          if (user) {
            console.log(user);

            // Update
            User.findOneAndUpdate(
              { _id: profileFields.id },
              { $set: profileFields },
              { new: true }
            ).then((user) => res.json(user));

            console.log(`Password Updated ${profileFields.password}`);
          } else {
            // Create
            res.send("No user found");
          }
        });
      });
    });

    // res.send(profileFields.hobbies);
    // res.send(req.body.handle);
  }
);

// @route   GET api/users/changepassword
// @desc    Change Password
// @access  Private
router.put(
  "/changepassword",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    console.log("Hello User");

    //const { errors, isValid } = validateUserInput(req.body);

    // // Check Validation
    // if (!isValid) {
    //   return res.status(400).json(errors);
    // }
    console.log(req.body);

    // Get fields
    const profileFields = {};
    profileFields.user = req.body.id;

    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(req.body.password, salt, (err, hash) => {
        if (req.body.password) profileFields.password = req.body.password;
        profileFields.password = hash;
      });
    });

    console.log(profileFields);

    User.findById(req.body.id).then((user) => {
      if (user) {
        User.findOneAndUpdate(
          { _id: req.user.id },
          { $set: profileFields },
          { new: true }
        ).then((user) => res.json(user));

        console.log("password changed");
      } else {
        // Create
        res.send("No user found");
      }
    });
  }
);

module.exports = router;
