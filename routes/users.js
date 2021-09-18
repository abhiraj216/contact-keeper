const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const auth = require("../midleware/auth");
const { check, validationResult } = require("express-validator/check");

const User = require("../models/User");

//@route  POST api/users
//@desc   Register a user
//@acces  Public

router.post(
  "/", 

  [
    check("name", "Name is required ").not().isEmpty(),
    check("email", "please include  valid email").isEmail(), // check weaher email , name ntered is valid or not;
    check("password", "please enter pssword with 6 or more charcters").isLength(
      { min: 6 }
    ),
  ],
  async (req, res) => {
    const errors = validationResult(req); // if there i something enterd n validation check store it inm erors
    if (!errors.isEmpty()) {
      // if errors not empty
      return res.status(400).json({ error: errors.array() }); //will give array of errors
    }
    const { name, email, password } = req.body; //_--> fetch req.body gives the data from the roout user ie : name email;
  
  
    try {
     
      let user = await User.findOne({ email }); //go inisde th user email and check weather user alraey exists or not
      if (user) {
        return res.status(400).json({ msg: "user already exists" });
      }
      user = new User({
        name,
        email,
        password
      });

      const salt = await bcrypt.genSalt(10); // hashing the passwords

      user.password = await bcrypt.hash(password, salt); // hashes th password

      await user.save(); // saving new  user
      const payload = {
        user: {
          id: user.id,
        },
      };
      jwt.sign(
        payload,
        config.get("jwtSecret"),
        {
          expiresIn: 3600,
        },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
    // error in registration show server error msg

      console.error(err);
      res.status(500).send("server error");
    }
  }
);

module.exports = router;
