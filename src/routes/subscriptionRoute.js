const { Router } = require("express");
const { authorize } = require("../service/authService");
const userController = require("../controllers/userController");

const subscriptionRouter = Router();

subscriptionRouter.post("", authorize, userController.makeUserPremium);

module.exports = {
  subscriptionRouter,
};
