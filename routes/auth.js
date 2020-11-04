"use strict";

const Router = require("express").Router;
const router = new Router();
const { UnauthorizedError, BadRequestError } = require("../expressError");
const User = require("../models/user")
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");



/** POST /login: {username, password} => {token} */
router.post("/login", async function (req, res, next) {
    try {
      const { username, password } = req.body;
      const result = await User.authenticate(username, password);
         console.log(result)
      if (result == true) {
          console.log("HEEEELLLOOO")
        let token = jwt.sign({ username }, SECRET_KEY);
        return res.json({ token });
      }
      
      throw new BadRequestError("Invalid user/password");
    } catch (err) {
      return next(err);
    }
  });


/** POST /register: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 */
router.post("/register", async function (req, res, next) {
    try {
      const { username, password, first_name, last_name, phone } = req.body;
      const result = User.register({username, password, first_name, last_name, phone})
      
      if (result) {
        let token = jwt.sign({ username }, SECRET_KEY);
        return res.json({ token });
      }
      
      throw new BadRequestError("Invalid input");
    } catch (err) {
      return next(err);
    }
  });

module.exports = router;