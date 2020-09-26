const express =require('express');
const router = express.Router();
const auth = require('../../middleware/auth')
const Profile = require('../../models/Profile')



// @Route GET api/profile/me
// @access Private
router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({user : req.user.id}).populate("user", ["name", "avatar"]);
        if(!profile){
            return res.status(400).json({ msg : 'Theres no profile for this user'});
        }
        res.json(profile);
    } catch (error) {
        console.error(error.message);
        res.status(500).json('Server Error');
    }
} );


module.exports = router;