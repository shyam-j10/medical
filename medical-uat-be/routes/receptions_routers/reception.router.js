const app = require("express")
const receptionControler  = require("../../controlers/receptoin/reception")
const { authMiddleware } = require("../../middlewares/auth/auth")
const  router = app.Router()

// router.use(authMiddleware)
router.get("/getpatients", receptionControler.getPatientsByReceptionId)
router.post("/addpatient",authMiddleware, receptionControler.addPatient)
router.post("/editepatient", receptionControler.updatePatient)
router.get("/profile", receptionControler.getReceptionProfileData)

module.exports = router