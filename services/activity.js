const Activity = require('../models/activity')

const getActivities = async from => {
  const activities = await Activity.find({ date: { $gte: from } })
  return activities
}

module.exports = {
  getActivities
}