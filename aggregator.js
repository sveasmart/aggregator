let EnergyEvents
const moment = require('moment')


/**
 * Takes the given array of events and returns a new array with an aggregated (resampled)
 * array of events.
 *
 * The events must be in chronological order and should all have the same meterName,
 * otherwise we bail out.
 *
 * @param smallEvents
 * @param sampleSizeSeconds
 * @returns {Array}
 */
module.exports.aggregate = function(smallEvents, sampleSizeSeconds) {
  const bigEvents = []

  let currentBigEvent = null
  let lastEndTimeChecked = null


  smallEvents.forEach((smallEvent) => {
    if (lastEndTimeChecked) {
      if (smallEvent.endTime <= lastEndTimeChecked) {
        throw "These events are not in chronological order!"
      }
    }
    console.log("currentBigEvent", currentBigEvent)
    if (!currentBigEvent) {
      currentBigEvent = createNewBigEvent(smallEvent, sampleSizeSeconds)
      bigEvents.push(currentBigEvent)
    } else {
      if (doesSmallEventBelongInBigEvent(smallEvent, currentBigEvent)) {
        console.log("Small event belongs in big event", smallEvent, currentBigEvent)
        addSmallEventToBigEvent(smallEvent, currentBigEvent)
      } else {
        console.log("Small event does NOT belong in big event", smallEvent, currentBigEvent)
        currentBigEvent = createNewBigEvent(smallEvent, sampleSizeSeconds)
        bigEvents.push(currentBigEvent)
      }
    }
    lastEndTimeChecked = smallEvent.endTime


  })
  console.log("Will return", bigEvents)

  return bigEvents
}

/**
 * Compacts everything from 24 hours ago and older into 5 minute sample size
 */
function aggrateEvents() {
  const sampleSize = 60 * 5 //5 minutes
  const untilDate = moment().remove(1, 'd')
  const smallEvents = EnergyEvents.find({
    endTime: {$lt: untilDate},
    seconds: {$lt: sampleSize}
  })

  return aggregate(smallEvents, sampleSize)
}



function createNewBigEvent(smallEvent, sampleSizeSeconds) {
  const bucket = getBucket(getStartTime(smallEvent), sampleSizeSeconds)

  return {
    meterName: smallEvent.meterName,
    seconds: sampleSizeSeconds,
    endTime: getEndTimeForBucket(bucket, sampleSizeSeconds),
    energy: smallEvent.energy
  }
}

function getStartTime(event) {
  return new Date(event.endTime.getTime() - (event.seconds * 1000))
}

function getEndTime(startTime, sampleSizeSeconds) {
  return new Date(startTime.getTime() + (sampleSizeSeconds * 1000))
}


/**
 * True if they belong to the same meter, and if
 * the start time of the smallEvent is within the bigEvent time interval.
 * We assume that all the pulses in the smallEvent happened at the beginning of that time interval.
 * @param smallEvent
 * @param bigEvent
 * @param sampleSize
 */
function doesSmallEventBelongInBigEvent(smallEvent, bigEvent) {
  if (smallEvent.meterName != bigEvent.meterName) {
    return false
  }

  const bigEventStartTime = getStartTime(bigEvent)
  const smallEventStartTime = getStartTime(smallEvent)

  return (smallEventStartTime >= bigEventStartTime) && (smallEventStartTime < bigEvent.endTime)
}

function addSmallEventToBigEvent(smallEvent, bigEvent) {
  console.assert(smallEvent.meterName == bigEvent.meterName, "Hey, these events belong to different meters!")

  bigEvent.energy = bigEvent.energy + smallEvent.energy
}


/**
 * Returns the time bucket that the given date belongs in.
 * And what's a bucket?
 * Imagine that we divide all of time (since 1 jan 1970) into 10 second buckets (assuming this.eventInterval is 10).
 * This method returns the bucket number of the given date.
 * So 1 January 1970 00:00:00.000 - 00:00:09.999 is bucket #0
 * So 1 January 1970 00:00:10.000 - 00:00:19.999 is bucket #1, etc
 */
function getBucket(date, sampleSizeSeconds) {
  const bucketSize = sampleSizeSeconds * 1000
  return Math.floor(date.getTime() / bucketSize)
}

function getEndTimeForBucket(bucket, sampleSizeSeconds) {
  return new Date((bucket + 1) * sampleSizeSeconds * 1000)
}

