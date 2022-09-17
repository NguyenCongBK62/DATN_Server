const express = require("express");
const router = require("express-promise-router")();
const fileUploader = require("../configs/cloudinary.config");
const adminController = require("../controllers/admin");
const passport = require("passport");
const passportConfig = require("../middlewares/userPassport");

router
  .route("/signin")
  .post(
    passport.authenticate("local", { session: false }),
    adminController.signIn,
  );

router
  .route("/cloudinary-upload")
  .post(fileUploader.single("file"), (req, res, next) => {
    if (!req.file) {
      next(new Error("No file uploaded!"));
      return;
    }
    res.json({ secure_url: req.file.path });
  });

router.route("/post-job").post((req, res) => adminController.postJob(req, res));

router
  .route("/companyprofile")
  .post((req, res) => adminController.updateCompanyProfile(req, res));
router
  .route("/getprofile")
  .post((req, res) => adminController.getProfile(req, res));
router
  .route("/getlistjob")
  .post((req, res) => adminController.getListJob(req, res));
router.route("/getjob").post((req, res) => adminController.getJob(req, res));
router
  .route("/deletejob")
  .post((req, res) => adminController.deleteJob(req, res));
router
  .route("/listcv")
  .post((req, res, next) => adminController.getListCV(req, res, next));
router
  .route("/setPassCV/:candidatecvid")
  .put((req, res, next) => adminController.setPassCV(req, res, next));
router
  .route("/deletecv/:candidatecvid")
  .delete((req, res, next) =>
    adminController.deleteCandidateCV(req, res, next),
  );

router.route("/mailresetpwrequest").post((req, res, next) => {
  adminController.resetPasswordMailer(req, res, next);
});

router.route("/changepass").post((req, res, next) => {
  adminController.changePass(req, res, next);
});

router.route("/checkAccount").post((req, res, next) => {
  adminController.checkAccount(req, res, next);
});

module.exports = router;
