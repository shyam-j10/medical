
const app = require("express")
const Router = app.Router()
const userRouter = require("./userRouter/user.router")
const receptionRouter = require("./receptions_routers/reception.router")

Router.use("/user", userRouter)
Router.use("/reception", receptionRouter)

module.exports = Router