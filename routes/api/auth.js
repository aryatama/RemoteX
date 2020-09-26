const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config')
const { body, validationResult } = require('express-validator');


// @Route GET api/auth
// @access Public
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ msg: "Server Error" });
    }
});


router.post('/',
    [
        //validation the body
        body('email', 'Please include a valid email').isEmail(),
        body('password', 'Password is required').exists()
    ],
    async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        try {
            //check user already exist
            let user = await User.findOne({ email: email })
            if (!user) {
                return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
            }

            const payload = {
                user: {
                    id : user.id
                }
            }

            jwt.sign(payload, config.get('jwtSecret'), (err, token) => {
                if (err) throw err;
                res.json({ token });
            })

        } catch (error) {
            //server error
            console.error(error.message);
            res.status(500).send("ServerError")
        }
    });


module.exports = router;