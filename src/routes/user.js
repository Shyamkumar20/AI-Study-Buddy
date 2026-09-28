const router = require("express").Router();
const { protect } = require("../middleware/auth");
const {
  getProfile,
  updateProfile,
  getStats,
  getNotifications,
} = require("../controllers/userController");

router.use(protect);

router.get("/me", getProfile);
router.put("/profile", updateProfile);
router.get("/stats", getStats);
router.get("/notifications", getNotifications);

module.exports = router;
