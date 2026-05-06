import express from "express";
import {createAppointment,deleteAppointment,getAppointments, getAvailability, getHairdressers, getSchedule, getServices, setSchedule, updateAppointment} from "../controllers/appointmentController";

const router = express.Router();

router.post("/", createAppointment);
router.get("/", getAppointments);

router.get("/availability", getAvailability);

router.post("/schedule", setSchedule);
router.get("/schedule", getSchedule);

router.delete("/:id", deleteAppointment);
router.put("/:id", updateAppointment);

router.get("/api/hairdressers", getHairdressers);
router.get("/api/services", getServices);


export default router;