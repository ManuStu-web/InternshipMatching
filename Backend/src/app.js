const express = require("express");
const cors = require("cors");

const candidateRoutes = require("./routes/candidateRoutes");
const internshipRoutes = require("./routes/internshipRoutes");
const authRoutes = require("./routes/authRoutes");
const allocationRoutes = require("./routes/allocationRoutes");


const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/candidates", candidateRoutes);
app.use("/api/internships", internshipRoutes);
app.use("/api/allocation", allocationRoutes);
app.use("/api/auth", authRoutes)

app.get("/", (req, res) => {
    res.json({
        message: "Internship Matcher API is running"
    });
});

module.exports = app;