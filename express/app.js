const config = require("../config"),
Discord = require("discord.js"),
utils = require("./utils"),
glob = require("glob"),
CheckAuth = require("./auth/CheckAuth"),
availableLanguages = require("fs").readdirSync("languages/");

module.exports.load = async(client) => {

    /* Init express app */

    const express = require("express"),
    bodyParser = require("body-parser"),
    session = require("express-session"),
    path = require("path"),
    app = express();

    const passport = require("passport");
    const { Strategy } = require("passport-discord");

    /* Routers */

    const mainRouter = require("./routes/index.js");

    const dashboardRouters = glob
    .sync("**/**.js", { cwd: `./express/routes/dashboard` } )
    .map(filename => require(`./routes/dashboard/${filename}`))
    .filter(router => Object.getPrototypeOf(router) == express.Router);
    
    const apiRouters = glob
    .sync("**/**.js", { cwd: `./express/routes/api` } )
    .map(filename => require(`./routes/api/${filename}`))
    .filter(router => Object.getPrototypeOf(router) == express.Router);

    /* App configuration */
    app
    // Body parser (for post method)
    .use(bodyParser.json())
    .use(bodyParser.urlencoded({ extended: true }))
    // Set the engine to html (for ejs template)
    .engine("html", require("ejs").renderFile)
    .set("view engine", "ejs")
    // Set the css and js folder to ./public
    .use(express.static(path.join(__dirname, "/public")))
    // Set the ejs templates to ./views
    .set("views", path.join(__dirname, "/views"))
    // Set the dashboard port
    .set("port", config.expressServer.port)
    // Set the express session password and configuration
    .use(session({ secret: config.expressServer.expressSessionPassword, resave: false, saveUninitialized: false }))
    // Passport (for discord authentication)
    .use(passport.initialize())
    .use(passport.session())
    .use("/", mainRouter)

    // Listen
    app.listen(app.get("port"), (err) => {
        console.log("Atlanta Dashboard is listening on port "+app.get("port"));
    });

    // Passport is used for discord authentication
    passport.serializeUser((user, done) => {
        done(null, user);
    });
    passport.deserializeUser((obj, done) => {
        done(null, obj);
    });

    let disStrat = new Strategy({
        clientID:       client.user.id,
        clientSecret:   config.expressServer.secret,
        callbackURL:    config.expressServer.dashboard.baseURL+"/login",
        scope:          [ "identify", "guilds" ]
    }, function (accessToken, refreshToken, profile, done){
        process.nextTick(function(){
            return done(null, profile);
        });
    });

    passport.use(disStrat);

}