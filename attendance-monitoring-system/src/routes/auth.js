import { Router } from "express";
import { getCurrentUser, getPublicAuthConfig, register, acceptPrivacy, updatePassword } from "../controllers/auth-controller.js";
import { listColleges,completeRegistration } from '../controllers/portal-controller.js';
import { authenticateUser } from '../middleware/authenticate-user.js';
import { rateLimit } from "../middleware/rate-limit.js";

const router = Router();
router.get("/config", getPublicAuthConfig);
router.get('/colleges', rateLimit({max:60,bucket:'public-colleges'}), listColleges);
router.post('/register', rateLimit({max:8,windowMs:15*60_000,bucket:'register'}), register);
router.patch('/registration',authenticateUser,rateLimit({max:10,bucket:'registration-update',key:req=>req.authUser.id}),completeRegistration);
router.post("/privacy-consent",authenticateUser,rateLimit({max:10,bucket:"privacy-consent",key:req=>req.authUser.id}),acceptPrivacy);
router.post("/password",authenticateUser,rateLimit({max:5,bucket:"password-update",key:req=>req.authUser.id}),updatePassword);
router.get("/me", rateLimit({ max: 120 }), getCurrentUser);

export default router;
