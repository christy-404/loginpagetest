const express = require("express");

const app = express();
const PORT = 3000;

app.use(express.static(__dirname));
app.use(express.json());

app.post("/login", (req, res) => {
    const { email, password } = req.body;

    if (
        email === "admin@abdsports.com" &&
        password === "admin123"
    ) {
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});