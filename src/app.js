const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const electionRoutes = require("./routes/ElectionRoutes");

const app = express();

app.use(express.json());

//Register API Routes
app.use("/api/auth", authRoutes);
app.use("/api/elections", electionRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Online Voting System API is running",
  });
});

//Handle Unknown Routes(keep this last)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

module.exports = app;
