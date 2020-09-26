const express =require('express');
const router = express.Router();

// @Route GET api/post
// @access Public



router.get('/', (req, res) => res.send('Posts route') );


module.exports = router;