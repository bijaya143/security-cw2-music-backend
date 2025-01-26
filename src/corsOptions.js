const config = require("./config");

// white list domains for access
let whitelist = ["http://localhost:3000"];
if (config.ENV === "dev") {
  whitelist = [];
}
if (config.ENV === "qa") {
  whitelist = [];
}
if (config.ENV === "prod") {
  whitelist = [];
}

const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

module.exports = {
  corsOptions,
};
