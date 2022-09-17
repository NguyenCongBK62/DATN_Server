const passport = require("passport");
const bcrypt = require("bcrypt-nodejs");
const db = require("../databaseConfig");
const jwtStrategy = require("passport-jwt").Strategy;
const localStraegy = require("passport-local").Strategy;
const GoogleTokenStrategy = require("passport-google-token").Strategy;
const { ExtractJwt } = require("passport-jwt");
const { JWT_SECRET } = require("../configs");
const pool = require("../configs/databaseConnect");
passport.use(
  new jwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken("Authorization"),
      secretOrKey: JWT_SECRET,
    },
    async (payload, done) => {
      try {
        let account = await pool
          .query("select * from account where id = $1", [payload.sub])
          .then((results) => {
            return results.rows[0];
          })
          .catch((err) => {
            console.log(err);
            const error = new Error(
              "Thêm dữu liệu không thành công vui lòng kiểm tra lại !",
            );
            error.statusCode = 303;
            throw error;
          });
        if (!account) return done(null, false);
        done(null, account);
      } catch (err) {
        done(error, false);
      }
    },
  ),
);

passport.use(
  new GoogleTokenStrategy(
    {
      clientID: process.env.clientID,
      clientSecret: process.env.clientSecret,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const account = await db("account").select("*").where({
          authgoogleid: profile.id,
          authtype: "google",
        });
        if (account[0]) return done(null, account[0]);
        db("account")
          .insert({
            authgoogleid: profile.id,
            authtype: "google",
            email: profile.emails[0].value,
            username: profile.displayName,
          })
          .returning("*")
          .then((account) => {
            return done(null, account[0]);
          })
          .catch((err) => console.log(err));
      } catch (error) {
        done(error, false);
      }
    },
  ),
);

passport.use(
  new localStraegy(
    {
      usernameField: "email",
    },
    async (email, password, done) => {
      try {
        let account = await pool
          .query("select * from account where email = $1", [email])
          .then((results) => {
            return results.rows[0];
          })
          .catch((err) => {
            console.log(err);
            const error = new Error(
              "Thêm dữu liệu không thành công vui lòng kiểm tra lại !",
            );
            error.statusCode = 303;
            throw error;
          });
        if (!account) return done(null, false);
        const isValid = await bcrypt.compareSync(password, account.password);
        if (!isValid) return done(null, false);
        done(null, account);
      } catch (error) {
        done(error, false);
      }
    },
  ),
);
