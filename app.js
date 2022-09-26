const express = require('express');
const { sequelize } = require('./models/index.js');
const app = express();
var bodyParser = require('body-parser')
const port = 80;

const routes = require('./routes/web.js');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use(routes);
app.listen(port, async () => {
    await sequelize.authenticate();
    console.log('Database connected!');
    console.log(`Tele WebService listening on port ${port}`);
})
