const express = require("express");
const authRoutes = require("./routes/authRoutes");
const electionRoutes = require("./routes/ElectionRoutes");
const positionRoutes = require("./routes/positionRoutes");

const app = express();

app.use(express.json());

//Register API Routes
app.use("/api/auth", authRoutes);
app.use("/api/elections", electionRoutes);
app.use('/api/candidates', require('./routes/candidateRoute'));
app.use('/api/votes', require('./routes/voteRoute'));
app.use('/api/positions', require('./routes/positionRoutes'));

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Online Voting System API is running",
  });
});

module.exports = app;
