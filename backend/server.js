const express = require("express");
const cors = require("cors");

const app = express();

// CORS configuration
// Parse comma-separated URLs from env vars into a flat array
const parseOrigins = (...envVars) =>
  envVars
    .filter(Boolean)
    .flatMap(v => v.split(",").map(url => url.trim()))
    .filter(Boolean);

const allowedOrigins = parseOrigins(
  process.env.FRONTEND_URL,
  process.env.API_URL,
  process.env.LOCAL_URL
);

if (allowedOrigins.length === 0) {
  console.warn("WARNING: No CORS origins configured! Set FRONTEND_URL, API_URL, or LOCAL_URL env vars.");
}

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (e.g. server-to-server, curl, health checks)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    console.warn(` CORS blocked request from origin: ${origin}`);
    console.warn(` Allowed origins: ${allowedOrigins.join(", ")}`);
    return callback(new Error(`CORS: Origin ${origin} not allowed`));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};

// Handle preflight OPTIONS requests explicitly
app.options("*", cors(corsOptions));
app.use(cors(corsOptions));

console.log("CORS allowed origins:", allowedOrigins);

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

const db = require("./app/models");
db.mongoose
  .connect(db.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Connected to the database!");
  })
  .catch(err => {
    console.log("Cannot connect to the database!", err);
    process.exit();
  });

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Test application." });
});

require("./app/routes/turorial.routes")(app);

// set port, listen for requests
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});