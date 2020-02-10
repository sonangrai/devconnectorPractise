const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const Profile = require("../../models/Profile");
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");
const config = require("config");
const request = require("request");

// @route GET api/Profile/me
// @desc GEting current user profile
//@access Private
router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id
    }).populate("user", ["name", "avatar"]);

    if (!profile) {
      return res.status(400).json({ msg: "Users Profile Not fund" });
    }

    res.status(200).json(profile);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
});

// @route POST api/Profile
// @desc GEting current user profile
//@access Private
router.post(
  "/",
  [
    auth,
    [
      check("status", "status is Required")
        .not()
        .isEmpty(),
      check("skills", "Skills is Required")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin
    } = req.body;

    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) {
      profileFields.skills = skills.split(",").map(skill => skill.trim());
    }

    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;

    try {
      let profile = await Profile.findOne({ user: req.user.id });

      if (profile) {
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );
        return res.json(profile);
      }

      profile = new Profile(profileFields);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.log(err.message);
      res.status(400).send("Server Error");
    }
  }
);

// @route GET api/Profile
// @desc GEting current user profile
//@access Public
router.get("/", async (req, res) => {
  try {
    const profile = await Profile.find().populate("user", ["name", "avatar"]);
    res.json(profile);
  } catch (err) {
    console.err(err.message);
    res.status(500).json("error");
  }
});

// @route GET api/Profile/user/user_id
// @desc GEting current user profile
//@access Public
router.get("/user/:user_id", async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id
    }).populate("user", ["name", "avatar"]);
    if (!profile) {
      return res.status(400).send("No profile of this user");
    }
    res.json(profile);
  } catch (err) {
    console.err(err.message);
    res.status(500).json("error");
  }
});

// @route DELETE api/Profile/user/user_id
// @desc GEting current user profile
//@access Private
router.delete("/", auth, async (req, res) => {
  try {
    await Profile.findOneAndRemove({
      user: req.user.id
    });
    await User.findOneAndRemove({
      user: req.user._id
    });

    res.send("Deleted user");
  } catch (err) {
    console.error(err.message);
    res.status(500).json("error");
  }
});

// @route PUT api/Profile/experincee
// @desc Add Experince
//@access Private
router.put(
  "/experience",
  [
    auth,
    [
      check("title", "Title is require")
        .not()
        .isEmpty(),
      check("from", "From date is require")
        .not()
        .isEmpty(),
      check("company", "Company is require")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description
    } = req.body;

    const newEx = {
      title,
      company,
      location,
      from,
      to,
      current,
      description
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.experience.unshift(newEx);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error");
    }
  }
);

// @route DELETE api/Profile/experincee/:exp_id
// @desc Delete Experince
//@access Private
router.delete("/experience/:exp_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    const removeIndex = profile.experience
      .map(item => item.id)
      .indexOf(req.params.exp_id);
    profile.experience.splice(removeIndex, 1);
    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error");
  }
});

// @route PUT api/Profile/education
// @desc Add Education
//@access Private
router.put(
  "/education",
  [
    auth,
    [
      check("school", "School is require")
        .not()
        .isEmpty(),
      check("from", "From date is require")
        .not()
        .isEmpty(),
      check("degree", "Degree is require")
        .not()
        .isEmpty(),
      check("fieldofstudy", "field of study is require")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description
    } = req.body;

    const newEdu = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.education.unshift(newEdu);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error");
    }
  }
);

// @route DELETE api/Profile/education/:exp_id
// @desc Delete Education
//@access Private
router.delete("/education/:exp_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    const removeIndex = profile.education
      .map(item => item.id)
      .indexOf(req.params.exp_id);
    profile.education.splice(removeIndex, 1);
    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error");
  }
});

// @route GET api/Profile/github/:username
// @desc Getgithub repos
//@access Public
router.get("/github/:username", (req, res) => {
  try {
    const options = {
      uri: `https://api.github.com/users/${
        req.params.username
      }/repos?per_page=5&sort=created:asc&client_id=${config.get(
        "githubclientid"
      )}&client_secret=${config.get("githubsecret")}`,
      method: "GET",
      headers: { "user-agent": "node.js" }
    };
    request(options, (error, response, body) => {
      if (error) {
        console.error(error);
      }
      if (response.statusCode !== 200) {
        res.status(404).json({ msg: "User in git not found" });
      }

      res.json(JSON.parse(body));
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error");
  }
});

module.exports = router;
