const mocha = require("mocha")
const chai = require("chai");
const assert = chai.assert
const expect = chai.expect

const aggregate = require("./aggregator").aggregate

describe('aggregator', function() {
  it('echo', function() {
    const event1 = {
      meterName: "bla",
      endTime: new Date("2017-01-01T12:00:10"),
      seconds: 10,
      energy: 1
    }

    const eventsToAggregate = [event1]
    const aggregatedEvents = aggregate(eventsToAggregate, 10)

    expect(aggregatedEvents).to.deep.equal([
      {
        meterName: "bla",
        endTime: new Date("2017-01-01T12:00:10"),
        seconds: 10,
        energy: 1
      }
    ])
  }),

  it('echo', function() {
    const event1 = {
      meterName: "bla",
      endTime: new Date("2017-01-01T12:00:10"),
      seconds: 10,
      energy: 1
    }

    const eventsToAggregate = [event1]
    const aggregatedEvents = aggregate(eventsToAggregate, 10)

    expect(aggregatedEvents).to.deep.equal([
      {
        meterName: "bla",
        endTime: new Date("2017-01-01T12:00:10"),
        seconds: 10,
        energy: 1
      }
    ])
  }),

  it('single event 10 -> 20', function() {
    const event1 = {
      meterName: "bla",
      endTime: new Date("2017-01-01T12:00:10"),
      seconds: 10,
      energy: 1
    }

    const eventsToAggregate = [event1]
    const aggregatedEvents = aggregate(eventsToAggregate, 20)

    expect(aggregatedEvents).to.deep.equal([
      {
        meterName: "bla",
        endTime: new Date("2017-01-01T12:00:20"),
        seconds: 20,
        energy: 1
      }
    ])
  }),

  it('single event 20 -> 10', function() {
    const event1 = {
      meterName: "bla",
      endTime: new Date("2017-01-01T12:00:20"),
      seconds: 20,
      energy: 1
    }

    const eventsToAggregate = [event1]
    const compactedEvents = aggregate(eventsToAggregate, 10)

    expect(compactedEvents).to.deep.equal([
      {
        meterName: "bla",
        endTime: new Date("2017-01-01T12:00:10"),
        seconds: 10,
        energy: 1
      }
    ])
  })

  it('two events 10 -> 20', function() {
    const eventsToAggregate = [
      {
        meterName: "bla",
        endTime: new Date("2017-01-01T12:00:10"),
        seconds: 10,
        energy: 1
      },
      {
        meterName: "bla",
        endTime: new Date("2017-01-01T12:00:20"),
        seconds: 10,
        energy: 1
      }

    ]
    const compactedEvents = aggregate(eventsToAggregate, 20)

    expect(compactedEvents).to.deep.equal([
      {
        meterName: "bla",
        endTime: new Date("2017-01-01T12:00:20"),
        seconds: 20,
        energy: 2
      }
    ])
  })

  it('two events 10 -> 10', function() {
    const eventsToAggregate = [
      {
        meterName: "bla",
        endTime: new Date("2017-01-01T12:00:10"),
        seconds: 10,
        energy: 1
      },
      {
        meterName: "bla",
        endTime: new Date("2017-01-01T12:00:20"),
        seconds: 10,
        energy: 1
      }

    ]
    const compactedEvents = aggregate(eventsToAggregate, 10)

    expect(compactedEvents).to.deep.equal(eventsToAggregate)
  })

  it('two events 10 -> 60', function() {
    const eventsToAggregate = [
      {
        meterName: "bla",
        endTime: new Date("2017-01-01T12:00:10"),
        seconds: 10,
        energy: 1
      },
      {
        meterName: "bla",
        endTime: new Date("2017-01-01T12:00:30"),
        seconds: 10,
        energy: 1
      }

    ]
    const compactedEvents = aggregate(eventsToAggregate, 60)

    expect(compactedEvents).to.deep.equal([
      {
        meterName: "bla",
        endTime: new Date("2017-01-01T12:01:00"),
        seconds: 60,
        energy: 2
      }
    ])
  })

  it('two events 10 -> 15', function() {
    const eventsToAggregate = [
      {
        meterName: "bla",
        endTime: new Date("2017-01-01T12:00:10"),
        seconds: 10,
        energy: 1
      },
      {
        meterName: "bla",
        endTime: new Date("2017-01-01T12:00:20"),
        seconds: 10,
        energy: 1
      }

    ]
    const compactedEvents = aggregate(eventsToAggregate, 15)

    expect(compactedEvents).to.deep.equal([
      {
        meterName: "bla",
        endTime: new Date("2017-01-01T12:00:15"),
        seconds: 15,
        energy: 2
      }

    ])
  })

  it('three events 10 -> 15', function() {
    const eventsToAggregate = [
      {
        meterName: "bla",
        endTime: new Date("2017-01-01T12:00:10"),
        seconds: 10,
        energy: 1
      },
      {
        meterName: "bla",
        endTime: new Date("2017-01-01T12:00:20"),
        seconds: 10,
        energy: 1
      },
      {
        meterName: "bla",
        endTime: new Date("2017-01-01T12:00:30"),
        seconds: 10,
        energy: 1
      }

    ]
    const compactedEvents = aggregate(eventsToAggregate, 15)

    expect(compactedEvents).to.deep.equal([
      {
        meterName: "bla",
        endTime: new Date("2017-01-01T12:00:15"),
        seconds: 15,
        energy: 2
      },
      {
        meterName: "bla",
        endTime: new Date("2017-01-01T12:00:30"),
        seconds: 15,
        energy: 1
      }


    ])
  })

})
