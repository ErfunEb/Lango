var express = require('express');
var router = express.Router();
const { check, validationResult} = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const auth = require("../middlewares/auth");

// route for sign up new users
router.post('/signup', [
  check("username", "Please Enter a Valid Username")
  .not()
  .isEmpty(),
  check("email", "Please enter a valid email").isEmail(),
  check("password", "Please enter a valid password").isLength({
      min: 6
  })
], async (req, res, next) => {
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
        status: false,
        errors: errors.array()
    });
  }

  const {
    username,
    email,
    password
  } = req.body;

  try {
    let user = await User.findOne({
        email
    });
    if (user) {
        return res.status(400).json({
          status: false,
          message: "User Already Exists"
        });
    }

    user = new User({
        username,
        email,
        password
    });
    
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    
    await user.save(); 
    
    const payload = {
        user: {
            id: user.id
        }
    };

    jwt.sign(
        payload,
        "randomString", {
            expiresIn: 10000
        },
        (err, token) => {
            if (err) throw err;
            res.status(200).json({
              status: true,
              token
            });
        }
    );
  } catch (err) {
      console.log(err.message);
      res.status(500).send("Error in Saving");
  }

});

// route for logging in users
router.post('/login', [
  check("email", "Please enter a valid email").isEmail(),
  check("password", "Please enter a valid password").isLength({
    min: 6
  })
], async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
        status: false,
        errors: errors.array()
    });
  }

  const { email, password } = req.body;

  try {
    let user = await User.findOne({
      email
    });
    if (!user)
      return res.status(400).json({
        status: false,
        message: "User Not Exist"
      });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({
        status: false,
        message: "Incorrect Password !"
      });

    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      "randomString",
      {
        expiresIn: 3600
      },
      (err, token) => {
        if (err) throw err;
        res.status(200).json({
          status: true,
          token
        });
      }
    );
  } catch (e) {
    console.error(e);
    res.status(500).json({
      status: false,
      message: "Server Error"
    });
  }

});

// route for getting user info
router.get('/profile', auth, async(req, res) => {
  try {
    // request.user is getting fetched from Middleware after token authentication
    const user = await User.findById(req.user.id);
    res.json(user);
  } catch (e) {
    res.send({ message: "Error in Fetching user" });
  }
});


module.exports = router;
