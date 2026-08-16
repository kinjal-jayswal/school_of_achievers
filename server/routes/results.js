const { makeContentRouter } = require("./contentRouter");

module.exports = makeContentRouter({ table: "results", dateColumn: "result_date" });
