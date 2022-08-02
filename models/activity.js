const mongoose = require('mongoose')

const ActivitySchema = new mongoose.Schema({
  user: {
    type: String,
    required: true,
  },
  contract: {
    type: Object,
    required: true
  },
  tokenId: {
    type: String,
    required: true
  },
  tokenName: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  date: {
    type: mongoose.SchemaTypes.Number,
    required: true
  },
  attributes: {
    type: Array
  },
  action: {
    type: String,
    required: true
  },
  info: {
    type: Object
  }
})

module.exports = mongoose.model('Activity', ActivitySchema);