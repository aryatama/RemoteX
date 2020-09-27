const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth')
const Profile = require('../../models/Profile')
const { body, validationResult } = require('express-validator');




// @Route GET api/profile/me
// @access Private
router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ userId: req.user.id }).populate("user", ["name", "avatar"]);
        if (!profile) {
            return res.status(400).json({ msg: 'Theres no profile for this user' });
        }
        res.json(profile);
    } catch (error) {
        console.error(error.message);
        res.status(500).json('Server Error');
    }
});


// @Route GET api/profile
// @access Private
router.post('/', [
    auth,
    [
        body('status', 'Status is required').not().isEmpty(),
        body('skills', 'Skills is required').not().isEmpty()
    ]
], async (req, res) => {
    const errors = validationResult(req)
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

    // Build profile object 
    const profileFields = {};
    profileFields.userId = req.user.id
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    // Skills - Spilt into array
    if (skills) {
        profileFields.skills = skills.split(',').map(skill => skill.trim());
    }

    // Social
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;


    try {
        let profile = await Profile.findOne({ userId: req.user.id });

        console.log(profile)
        if (profile) {
            // Update
            profile = await Profile.findOneAndUpdate(
                { userId: req.user.id },
                { $set: profileFields },
                { new: true }
            )
            return res.json(profile)
        }
        //Create
        profile = new Profile(profileFields)
        await profile.save();
        res.json(profile);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ msg: "Server Error" });
    }


    // try {
    //     let profile = await Profile.findOne({ user: req.user.id });
    //     if (profile) {
    //         // Update
    //         profile = await Profile.findOneAndUpdate(
    //             { user: req.user.id },
    //             { $set: profileFields },
    //             { new: true }
    //         )
    //         return res.json(profile)
    //     }

    //     //Create
    //     profile = new Profile(profileFields)
    //     await Profile.save();
    //     res.json(profile);

    // } catch (error) {
    //     console.error(error.message);
    //     res.status(500).json({ msg: "Server Error" });
    // }
})

module.exports = router;