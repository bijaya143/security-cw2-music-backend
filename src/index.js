const express = require("express");
const cors = require("cors");
const compression = require("compression");
const helmet = require("helmet");
const mongoose = require("mongoose");
const config = require("./config");
const bodyParser = require("body-parser");
const middleware = require("./util/middlewares");
const { router } = require("./routes/index");
const errorHandler = require("errorhandler");
const fileUpload = require("express-fileupload");
const path = require("path");
const { default: rateLimit } = require("express-rate-limit");
const session = require("express-session");
const morgan = require("morgan");
const fs = require("fs");
const https = require("https");
const http = require("http");

const app = express();

// Ensure the audit directory exists at the root level
const auditLogDir = path.join(process.cwd(), "audit");
if (!fs.existsSync(auditLogDir)) {
  fs.mkdirSync(auditLogDir);
}

// Create a write stream for logs in the root audit directory
const logStream = fs.createWriteStream(path.join(auditLogDir, "api.log"), {
  flags: "a",
});

// Custom format with timestamp
morgan.token("timestamp", () => new Date().toISOString());
const logFormat = "[:timestamp] :method :url :status :response-time ms";

// Use Morgan with custom format
app.use(morgan(logFormat, { stream: logStream }));

app.use(
  session({
    secret: config.SESSION_SECRET,
    resave: false, // Prevents session from being saved repeatedly
    saveUninitialized: false, // Only saves sessions that have been modified
    cookie: {
      secure: true, // Set to `true` if using HTTPS
      httpOnly: true, // Prevents JavaScript access to cookies
      maxAge: 900000, // Session expiry in milliseconds (e.g., 15 minutes)
    },
  })
);

// Load SSL/TLS certificates
const privateKey = fs.readFileSync("private.key", "utf8");
const certificate = fs.readFileSync("certificate.crt", "utf8");
const credentials = { key: privateKey, cert: certificate };

// Create HTTPS server
const httpsServer = https.createServer(credentials, app);

// Optional: Redirect HTTP to HTTPS
const httpServer = http.createServer((req, res) => {
  res.writeHead(301, { Location: `https://${req.headers.host}${req.url}` });
  res.end();
});

const HTTPS_PORT = 443;

httpsServer.listen(HTTPS_PORT, () => {
  console.log(`HTTPS Server running on port ${HTTPS_PORT}`);
});

const corsOptions = {
  origin: true,
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));
// app.use(
//   helmet({
//     crossOriginResourcePolicy: false,
//   })
// );
app.use(compression());

// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   limit: 1000, // Limit each IP to 1000 requests per `window` (here, per 15 minutes).
//   standardHeaders: "draft-8", // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
//   legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
// });

// Apply the rate limiting middleware to all requests.
// app.use(limiter);

// Use node like promise for mongoose
mongoose.Promise = global.Promise;

// Connect Mongo DB
mongoose.connect(`${config.MONGO_URL}`);

// Body Parser
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" })); // Parse application/x-www-form-urlencoded
app.use(bodyParser.json({ limit: "50mb" }));

// Info route
app.get("/", (req, res) => {
  return res.status(200).json({
    version: config.VERSION,
    name: "Welcome to Harmonica Backend",
  });
});

// Media Files
app.use(fileUpload());

app.use(express.static(path.join("public/uploads")));

// API
app.use("/api", router);

// Error Handler
app.use(errorHandler());
app.use(middleware.notFound);
app.use(middleware.errorHandler);

app.listen(config.PORT, "0.0.0.0", () => {
  console.log(`Listening: http://localhost:${config.PORT}`);
});

module.exports = app;
