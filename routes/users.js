const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require('config');
const router = express.Router();
const { check, validationResult } = require("express-validator");

const User = require("../models/User");
// @route       GET api/users
// @desc        regsiter a user
// @access      Public
router.post(
  "/",
  [
    check("name", "Please enter a name").not().isEmpty(),
    check("email", "Please enter a valid emai").isEmail(),
    check("password", "Please enter password with min 6 chars").isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({
        errors: errors.array(),
      });

    // destructor
    const { name, email, password } = req.body;

    // try catch
    try {
      // find user if he aready exists
      let user = await User.findOne({ email });
      // if he exists 
      if (user) {
        return res.status(400).json({ msg: "user exists" });
      }
      // make a new user by the model
      user = new User({ name, email, password });
      // genarate salt
      const salt = await bcrypt.genSalt(10);
      // hash password
      user.password = await bcrypt.hash(password, salt);

      // save user
      await user.save();

      const payload = {
          user:{
              id:user.id
          }
      }
      
      // make the token
      jwt.sign(payload,config.get("jwt"),{
        expiresIn:36000
      },(err,token)=>{
          if(err) console.log(err);
          res.json({token});
      });
      
    } catch (error) {
      console.log(error);
      res.status(500).send("server error");
    }
  }
);

module.exports = router;
