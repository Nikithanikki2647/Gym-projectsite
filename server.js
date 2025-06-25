const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require("express-session");
const path = require("path");
require("dotenv").config();

const app = express();

// MongoDB connection

// Import model
const Gym = require("./models/gym");

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));
app.use(session({
  secret: "mySecretKey",
  resave: false,
  saveUninitialized: false
}));

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB connected successfully"))
.catch((err) => console.error("❌ MongoDB connection error:", err));

// Registration form
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "reggym.html"));
});

// Submit registration
app.post("/submit", async (req, res) => {
  try {
    const newUser = new Gym(req.body);
    await newUser.save();
    res.redirect("/login.html");
  } catch (error) {
    res.status(500).send("❌ Error: " + error.message);
  }
});

// Login logic
app.post("/login", async (req, res) => {
  const { fullName, code } = req.body;

  try {
    const user = await Gym.findOne({ fullName });

    if (user && user.code === code) {
      req.session.user = user;
      return res.redirect("/gym");
    } else {
      return res.redirect("/error.html");
    }
  } catch (err) {
    res.status(500).send("❌ Server error");
  }
});

// Gym home page (dynamic)
app.get("/gym", (req, res) => {
  if (!req.session.user) return res.redirect("/login.html");

  const { fullName } = req.session.user;

  res.send(`
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <link rel="stylesheet" href="gymstyle.css">
    
</head>
<body>
    <header class="header">
        <div class="left">
            <img src="logo1.jpg" alt="" >
            <div>Fit Nation</div>
        </div>
   <div class="mid" >
    
        <a href="gym" >Home</a>&nbsp;&nbsp;
        <a href="class.html">Classes</a>&nbsp;&nbsp;
        <a href="trin.html">Traniers</a>&nbsp;&nbsp;
        <a href="cont.html">Contact</a>&nbsp;&nbsp;
   </div>
    <div class="right">
        <a href="call.html" >Call us</a>&nbsp;&nbsp;
        <a href="email.html">Email us</a>&nbsp;&nbsp;
        <a href="home1.html">Log Out</a>&nbsp;&nbsp;
    </div>
</header>
    <div class="class">
        <h3>Welcome to, Fit Nation!${fullName}.<h3>
           <h4> 
            At Fit Nation, we believe that fitness is a journey, and we're here to support you every step of the way. Whether you're just starting out or looking to take your training to the next level, our state-of-the-art facilities and dedicated trainers are here to help you achieve your goals.
           </h4>
    </div>
</body>
</html>
  `);
});

// Logout
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/logingym.html");
  });
});

// Start server
app.listen(3000, () => {
  console.log("🚀 Server running at http://localhost:3000");
});
