import { Router } from "express";
import * as asterisk from "../controllers/asteriskController.js";

const router = Router();

router.post("/connect", asterisk.connectToAsterisk);
router.post("/call", asterisk.makeCall);
router.post("/disconnect", asterisk.disconnectFromAsterisk);

export default router;
