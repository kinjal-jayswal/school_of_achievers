const { makeContentRouter } = require("./contentRouter");

module.exports = makeContentRouter({
    table: "events",
    dateColumn: "event_date",
    extraFields: [
        { name: "event_type", default: "celebration" },
        { name: "end_date" },
        { name: "campus", default: "both" },
        { name: "is_published", default: true },
    ],
});
