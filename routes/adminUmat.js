const router = require("express-promise-router")();
const passport = require("passport");
const passportConfig = require("../middlewares/userPassport");
const adminUmatController = require("../controllers/adminUmat");

router
  .route("/signin")
  .post(
    passport.authenticate("local", { session: false }),
    adminUmatController.signIn,
  );

router.route("/getAccountCompanyList").get((req, res, next) => {
  adminUmatController.getCompanyAccountList(req, res, next);
});

router.route("/companyaccountcreate").post((req, res, next) => {
  adminUmatController.createEditCompanyAccount(req, res, next);
});

router.route("/companyaccountedit/:companyid").post((req, res, next) => {
  adminUmatController.createEditCompanyAccount(req, res, next);
});

router.route("/getAccountCompany/:companyid").get((req, res, next) => {
  adminUmatController.getCompanyAccount(req, res, next);
});

router.route("/getAccountCandidateList").get((req, res, next) => {
  adminUmatController.getCandidateAccountList(req, res, next);
});

router.route("/candidateaccountcreate").post((req, res, next) => {
  adminUmatController.createEditCandidateAccount(req, res, next);
});

router.route("/candidateaccountedit/:accountid").post((req, res, next) => {
  adminUmatController.createEditCandidateAccount(req, res, next);
});

router.route("/getAccountCandidate/:accountid").get((req, res, next) => {
  adminUmatController.getCandidateAccount(req, res, next);
});

router.route("/deleteaccount/:id").delete((req, res, next) => {
  adminUmatController.deleteAccount(req, res, next);
});

module.exports = router;
