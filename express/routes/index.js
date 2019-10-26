const express = require("express"),
CheckAuth = require("../auth/CheckAuth"),
router = express.Router();

router.get("/", async (req, res) => {
    res.send("Hello");
});

router.get("/selector", CheckAuth, async(req, res) => {
    res.render("selector", {
        user: req.userInfos,
        language: req.language,
        currentURL: `${req.client.config.dashboard.baseURL}/${req.originalUrl}`
    });
});

module.exports = router;