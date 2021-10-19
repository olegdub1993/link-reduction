const { Router } = require("express");
const router = new Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("config");
const { check, validationResult } = require("express-validator");
router.post(
  "/reqister",
  [
    check("email", "incorrect email 1").isEmail(),
    check("password", "Min count is 6").isLength({ min: 6 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
          massage: "incorrect data with registration 2",
        });
      }
      const { password, email } = req.body;
      const candidat = await User.findOne({ email });
      if (candidat) {
        return res.status(400).json({ message: "this email already exist" });
      }
      const hashedPassword = await bcrypt.hash(password, 12);
      const user = new User({ email, password: hashedPassword });
      await user.save();
      res.status(201).json({ message: "new client is created" });
    } catch (error) {
      res.status(500).json({ message: "something going wrong,try again" });
    }
  }
);
router.post(
  "/login",
  [
    check("email", "incorrect email").normalizeEmail().isEmail(),
    check("password", "Min count is 6").exists(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
          massage: "incorrect data with  enter",
        });
      }
      const { password, email } = req.body;
      console.log("oo");
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "There are no such email" });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "wrong paasword, try again" });
      }
      const token = jwt.sign({ userId: user.id }, config.get("jwtSecret"), {
        expiresIn: "1h",
      });

      res.json({ token, userId: user.id });
    } catch (error) {
      res.status(500).json({ message: "something going wrong,try again" });
    }
  }
);
module.exports = router;
