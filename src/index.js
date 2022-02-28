const express = require("express");

const { PORT } = require("./constants");
const routes = require("./routes");
const { initDatabase } = require("./config/database-config");

const expressConfig = require("./config/express-config");
const hbsConfig = require("./config/hbs-config");

const app = express();

expressConfig(app);
hbsConfig(app);

app.use(routes);
initDatabase()
  .then(() => {
    app.listen(PORT, () =>
      console.log(`The app is running on http://localhost:${PORT}/`)
    );
  })
  .catch((err) => {
    console.log("Cannot connect to database: ", err);
  });
