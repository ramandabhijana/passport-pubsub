const express = require("express");
const session = require("express-session");
const cors = require("cors");
var passport = require("passport");

const app = express();
const PORT = 8080;

// ================== Begin Set up passport
const { Strategy: GoogleStrategy } = require("passport-google-oauth20");

const CLIENT_ID = "";
const CLIENT_SECRET = "";
const CALLBACK_URL = "";

passport.use(
  new GoogleStrategy(
    {
      clientID: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      callbackURL: CALLBACK_URL,
      passReqToCallback: true,
      scope: ["profile", "email"],
      store: true, // allowing for app-level state storage
    },
    async function (request, accessToken, refreshToken, profile, done) {
      try {
        // get the returned data from profile
        let data = profile?._json;

        // Check if the profile data is valid and complete
        if (!profile || !profile.id) {
          return done(new Error("Profile data is incomplete."), false);
        }

        // Perform your user lookup or creation logic here
        // ...

        // If the user is found or created, call done with the user object
        return done(null, profile._json);
      } catch (error) {
        console.log("Error during authentication:", error);
        return done(error, false);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});
// ================== End setup passport

app.use(session({ secret: "test", resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
app.use(cors());

// ================== Begin App routes
app.get("/oauth/google/:token", async (req, res, next) => {
  passport.authenticate("google", {
    scope: ["profile", "email"],
    state: { token: req.params.token },
    display: "popup",
  })(req, res, next);
});

app.get("/auth-response-events/:token", async (req, res, next) => {
  const token = req.params.token;

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  const redisClient = require("redis").createClient({
    socket: {
      port: 6379,
    },
  });
  const subscriber = await redisClient.connect();

  subscriber.subscribe(token, (message) => {
    console.log("message: ", message);
    res.write(`data: ${message}\n\n`); // format SSE data
  });

  req.on("close", () => {
    console.log("request closed");
    subscriber.unsubscribe();
    subscriber.quit();
  });
});

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  async function (req, res, next) {
    const token = req.authInfo.state.token;

    const message = JSON.stringify(req.user);

    const redisPublisher = require("redis").createClient();
    const publisher = await redisPublisher.connect();

    publisher
      .publish(token, message)
      .then((val) => {
        return res.send("ok");
      })
      .catch((e) => console.error("err publishing: ", e));
  }
);
// ================== End App routes

app.listen(PORT, () => {
  console.log(`Express Server listening at ${PORT}`);
});
