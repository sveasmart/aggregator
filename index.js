const MongoClient = require('mongodb').MongoClient
const meterName = "195861500" //Mr Blue 4
const aggregate = require('src/aggregator').aggregate


exports.handler = function(event, context, callback) {
  const mongoUrl = process.env.MONGO_URL
  // Use connect method to connect to the server

  let dbToClose
  let EnergyEvents
  let aggregated
  let originalCount
  const selector = {
    meterName: meterName,
    endTime: {
      $gt: new Date("2017-07-11T12:10:00"),
      $lt: new Date("2017-07-11T12:20:00")
    }}

  MongoClient.connect(mongoUrl)
    .then((db) => {
      dbToClose = db
      EnergyEvents = db.collection('energy_events')
      const cursor = EnergyEvents.find(selector)
      return cursor.toArray()
    })
    .then((energyEvents) => {
      originalCount = energyEvents.length
      aggregated = aggregate(energyEvents, 60)
      console.log("Resampled from " + energyEvents.length + " events to " + aggregated.length + " events")
      return EnergyEvents.deleteMany(selector)

    })
    .then((deleteResult) => {
      console.log("delete result: ", deleteResult)
      return EnergyEvents.insertMany(aggregated)
    })
    .then((insertResult) => {
      console.log("insert result: ", insertResult)

      dbToClose.close()
      callback(null, "Resampled from " + originalCount + " events to " + aggregated.length + " events")
    })

    .catch((err) => {
      console.log("Darn", err)
      callback(err)
    })
}

