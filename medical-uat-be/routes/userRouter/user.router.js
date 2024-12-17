const app = require("express")
const userControler  = require("../../controlers/userControler/user.controler")
const { route } = require("../api.router")
const       router = app.Router()

router.post("/register", userControler.RegisterMedicalUser)

module.exports = router