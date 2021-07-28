var express = require('express');
var router = express.Router();
const Language = require("../models/Language");

router.get('/', async (req, res) => {
  return res.status(400).json({
    status: true,
    data: await Language.find()
  });
})


module.exports = router;