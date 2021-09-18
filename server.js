const express = require("express");
const connectDB = require("./config/db");
const app = express();

//connects DataBase
connectDB();

app.get("/", (req, res) =>
  res.json({ msg: "Welcome to Contactkeeper API...." })
);
//Initialise Middlewware
app.use(express.json({extended: false})); // by doing that we can accept the data from users by mongodb

// Define Routes
app.use("/api/users", require("./routes/users"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/contacts", require("./routes/contacts"));

//Create a port
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV === 'production') {
  //Set static folder
  app.use(express.static('client/build'));

  app.get('*', (req, res) =>
    res.sendFile(
      path.resolved(__dirname, 'client', 'build', 'index.html')
    )
  );
}

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
