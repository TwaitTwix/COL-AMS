import { Router } from "express";
import {
  createEvent,
  createStudent,
  archiveEvent,
  archiveStudent,
  listEvents,
  listAuditLogs,
  listManagedUsers,
  listStudents,
  updateEvent,
  updateStudent,
  updateManagedUser,
} from "../controllers/admin-controller.js";
import { requireRoles, ADMIN_ROLES } from "../middleware/authenticate-user.js";
import { rateLimit } from "../middleware/rate-limit.js";
import { validate } from '../utils/validate.js';
import { z } from 'zod';
import { createCollege,eventQr,rotateQr,eventStatistics,reviewRegistration,securityDashboard,reviewAttendance,reviewDevice,readNotification,listNotifications } from '../controllers/portal-controller.js';

const router = Router();
for(const name of ['userId','studentId','eventId','attendanceId','incidentId','notificationId'])router.param(name,(_req,_res,next,value)=>{
  try{validate(z.string().uuid(),value);next();}catch(error){next(error);}
});
const officerAccess = [
  rateLimit({ max: 180, bucket: "admin-management-ip" }),
  ...requireRoles(...ADMIN_ROLES),
  rateLimit({ max: 90, bucket: "admin-management-user", key: (req) => req.authUser.id }),
];
router.get("/users", ...officerAccess, listManagedUsers);
router.get("/audit-logs", ...officerAccess, listAuditLogs);
router.get('/security',...officerAccess,securityDashboard);
router.get('/notifications',...officerAccess,listNotifications);
router.post('/colleges',...officerAccess,createCollege);
router.patch('/users/:userId/verification',...officerAccess,reviewRegistration);
router.get('/events/:eventId/qr',...officerAccess,eventQr);
router.post('/events/:eventId/qr/rotate',...officerAccess,rotateQr);
router.get('/events/:eventId/statistics',...officerAccess,eventStatistics);
router.patch('/attendance/:attendanceId/review',...officerAccess,reviewAttendance);
router.patch('/devices/:incidentId/review',...officerAccess,reviewDevice);
router.patch('/notifications/:notificationId/read',...officerAccess,readNotification);
router.patch("/users/:userId", ...officerAccess, updateManagedUser);
router.get("/students", ...officerAccess, listStudents);
router.post("/students", ...officerAccess, createStudent);
router.patch("/students/:studentId", ...officerAccess, updateStudent);
router.patch("/students/:studentId/archive", ...officerAccess, archiveStudent);
router.get("/events", ...officerAccess, listEvents);
router.post("/events", ...officerAccess, createEvent);
router.patch("/events/:eventId", ...officerAccess, updateEvent);
router.patch("/events/:eventId/archive", ...officerAccess, archiveEvent);

export default router;
