const express = require('express');
require('dotenv').config();
const { graphqlHTTP } = require('express-graphql');
require('colors');
const cors = require('cors');

const schema = require('./schema/schema');
const connectDB = require('./config/db');

const port = process.env.PORT || 5000;

const app = express();

// Cors
app.use(cors());

// Connect to DB
connectDB();

app.use(
    '/graphql',
    graphqlHTTP({
        schema,
        graphiql: process.env.NODE_ENV === 'development',
    })
);

app.listen(port, () => {
    console.log(
        `server running on port: ${port.toString().green.underline}`.white.bold
    );
});
