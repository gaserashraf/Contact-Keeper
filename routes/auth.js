const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../middlewire/auth");
const config = require("config");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const User = require("../models/User");

// @route       GET api/auth
// @desc        logged in user
// @access      Private

router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    console.log(error);
    res.status(500).send("server error");
  }
});

// @route       POST api/auth
// @desc        Auth user & get token
// @access      Private

router.post(
  "/",
  [
    check("email", "Please enter a vaild email").isEmail(),
    check("password", "Please enter a valid password").isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({
        errors: errors.array(),
      });
    let { email, password } = req.body;

    try {
      let user = await User.findOne({ email });
      if (!user) return res.status(400).json({ msg: "Email doesnot exists!" });

      // compare password enter with the hashed password
      const isMatchPassword = await bcrypt.compare(password, user.password);
      if (!isMatchPassword) {
        return res.status(400).json({ msg: "Invalid password!" });
      }

      const payload = {
        user: {
          id: user.id,
        },
      };

      // make the token
      jwt.sign(
        payload,
        config.get("jwt"),
        {
          expiresIn: 36000,
        },
        (err, token) => {
          if (err) console.log(err);
          res.json({ token });
        }
      );
    } catch (error) {
      console.log(error);
      res.status(500).send("server error");
    }
  }
);

module.exports = router;
