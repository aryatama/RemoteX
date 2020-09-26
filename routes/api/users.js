const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config')
const { body, validationResult } = require('express-validator');


//User Models
const User = require('../../models/User');

// @route POST api/users
// @desc register user
// @access Public
router.post('/',
    [
        //validation the body
        body('name', 'Name is required').not().isEmpty(),
        body('email', 'Please include a valid email').isEmail(),
        body('password', 'Please enter a password with 8 or more characthers').isLength({ min: 8 })
    ],
    async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, password } = req.body;

        try {

            //check user already exist
            let user = await User.findOne({ email: email })
            if(user) {
                return res.status(400).json({ errors : [{msg : 'User already exists'}] });
            }

            //gravatar things
            const avatar = gravatar.url(email, {
                s: '200',
                r: 'pg',
                d: 'mm'
            })

            user = new User ({
                name,
                email,
                avatar,
                password
            });

            //encrypt the password
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
            await user.save();

            const payload = {
                user :{
                    id : user.id
                }
            }

            jwt.sign(payload, config.get('jwtSecret'), (err, token) => {
                if(err) throw err;
                res.json({ token });
            } )

        } catch (error) {
            //server error
            console.error(error.message);
            res.status(500).send("ServerError")
        }
    });


module.exports = router;