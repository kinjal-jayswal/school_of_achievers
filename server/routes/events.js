const { makeContentRouter } = require("./contentRouter");

module.exports = makeContentRouter({ table: "events", dateColumn: "event_date" });
