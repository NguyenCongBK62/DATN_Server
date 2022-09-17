const router = require("express-promise-router")();
const passport = require("passport");
const passportConfig = require("../middlewares/userPassport");
const UserController = require("../controllers/user");

router
  .route("/signin")
  .post(
    passport.authenticate("local", { session: false }),
    UserController.signIn,
  );

router.route("/signup").post((req, res, next) => {
  UserController.signUp(req, res, next);
});

router
  .route("/secret")
  .get(passport.authenticate("jwt", { session: false }), UserController.secret);

router
  .route("/auth/google")
  .post(
    passport.authenticate("google-token", { session: false }),
    UserController.authGoogle,
  );

router.route("/getListCompany").get((req, res) => {
  UserController.getListCompany(req, res);
});

router.route("/job").get((req, res) => UserController.listJob(req, res));

router
  .route("/getprofilecompany")
  .post((req, res) => UserController.getProfileCompany(req, res));

router.route("/applyjob").post((req, res, next) => {
  UserController.applyJob(req, res, next);
});

router.route("/addreview/:companyid").post((req, res, next) => {
  UserController.addReview(req, res, next);
});

router.route("/listreview/:companyid").get((req, res, next) => {
  UserController.getListReview(req, res, next);
});

router.route("/job/:companyid").get((req, res, next) => {
  UserController.getListJobByCompanyId(req, res, next);
});

router.route("/jobsearch").get((req, res, next) => {
  UserController.getJobBySearch(req, res, next);
});

router.route("/mailresetpwrequest").post((req, res, next) => {
  UserController.resetPasswordMailer(req, res, next);
});

router.route("/getTechSkillList").get((req, res, next) => {
  UserController.getTechSkillList(req, res, next);
});

router.route("/getJobByTechSkill").get((req, res, next) => {
  UserController.getJobByTechSkill(req, res, next);
});

router.route("/getLisCompanySearch").get((req, res, next) => {
  UserController.getLisCompanySearch(req, res, next);
});

router.route("/getCityList").get((req, res, next) => {
  UserController.getCityList(req, res, next);
});

router.route("/getJobByCity").get((req, res, next) => {
  UserController.getJobByCity(req, res, next);
});

router.route("/changepass").post((req, res, next) => {
  UserController.changePass(req, res, next);
});

router.route("/checkAccount").post((req, res, next) => {
  UserController.checkAccount(req, res, next);
});

module.exports = router;
