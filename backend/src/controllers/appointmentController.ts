import { Request, Response } from "express";
import { db } from "../db/db";

export const createAppointment = async (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      date,
      startTime,
      hairdresserId,
      serviceId,
    } = req.body;

    // 1. szolgáltatás lekérése
    const [serviceRows]: any = await db.query(
      "SELECT * FROM services WHERE id = ?",
      [serviceId]
    );

    if (serviceRows.length === 0) {
      return res.status(404).json({ message: "Service not found" });
    }

    const duration = serviceRows[0].durationMinutes;

    // 2. időpont kiszámítása
    const start = new Date(`${date}T${startTime}`);
    const end = new Date(start.getTime() + duration * 60000);

    const endTime = end.toTimeString().slice(0, 5);

    // 3. ütközések lekérése ugyanarra a hairdresserre
    const [existing]: any = await db.query(
      `SELECT * FROM appointments 
       WHERE hairdresserId = ? AND date = ?`,
      [hairdresserId, date]
    );

    // 4. ütközés ellenőrzés
    for (let appt of existing) {
      const existingStart = new Date(`${appt.date}T${appt.startTime}`);
      const existingEnd = new Date(`${appt.date}T${appt.endTime}`);

      if (start < existingEnd && end > existingStart) {
        return res.status(400).json({
          message: "Time slot not available",
        });
      }
    }

    // 5. mentés
    await db.query(
      `INSERT INTO appointments 
      (name, email, date, startTime, endTime, hairdresserId, serviceId)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        email,
        date,
        startTime,
        endTime,
        hairdresserId,
        serviceId,
      ]
    );

    res.json({ message: "Appointment booked!" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error booking appointment" });
  }
};

export const getAppointments = async (_req: Request, res: Response) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM appointments ORDER BY date, startTime"
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Error fetching appointments",
    });
  }
};

export const getAvailability = async (req: Request, res: Response) => {
  try {
    const { hairdresserId, date, serviceId } = req.query;

    if (!hairdresserId || !date || !serviceId) {
      return res.status(400).json({ message: "Missing parameters" });
    }

    // 1. service duration
    const [serviceRows]: any = await db.query(
      "SELECT * FROM services WHERE id = ?",
      [serviceId]
    );

    if (serviceRows.length === 0) {
      return res.status(404).json({ message: "Service not found" });
    }

    const duration = serviceRows[0].durationMinutes;

    // 2. meglévő foglalások
    const [existing]: any = await db.query(
      `SELECT * FROM appointments 
       WHERE hairdresserId = ? AND date = ?`,
      [hairdresserId, date]
    );

    // 3. nyitvatartás
   const dateObj = new Date(date as string);
    const weekday = dateObj.getDay();

    const [schedule]: any = await db.query(
    `SELECT * FROM hairdresser_schedule 
    WHERE hairdresserId = ? AND weekday = ?`,
    [hairdresserId, weekday]
    )   ;

    if (schedule.length === 0) {
    return res.json([]); // nem dolgozik azon a napon
    }

    const startHour = parseInt(schedule[0].startTime.split(":")[0]);
    const endHour = parseInt(schedule[0].endTime.split(":")[0]);
    const step = 30; 

    const slots: string[] = [];

    for (let h = startHour; h < endHour; h++) {
      for (let m = 0; m < 60; m += step) {
        const start = new Date(`${date}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);

        const end = new Date(start.getTime() + duration * 60000);

        // ne lógjon túl 19:00-n
        const closing = new Date(`${date}T19:00`);
        if (end > closing) continue;

        let conflict = false;

        for (let appt of existing) {
          const existingStart = new Date(`${appt.date}T${appt.startTime}`);
          const existingEnd = new Date(`${appt.date}T${appt.endTime}`);

          if (start < existingEnd && end > existingStart) {
            conflict = true;
            break;
          }
        }

        if (!conflict) {
          slots.push(start.toTimeString().slice(0, 5));
        }
      }
    }

    res.json(slots);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error getting availability" });
  }
};

export const setSchedule = async (req: Request, res: Response) => {
  try {
    const { hairdresserId, weekday, startTime, endTime } = req.body;

    // opcionális: töröljük a régit ugyanarra a napra
    await db.query(
      `DELETE FROM hairdresser_schedule 
       WHERE hairdresserId = ? AND weekday = ?`,
      [hairdresserId, weekday]
    );

    await db.query(
      `INSERT INTO hairdresser_schedule 
      (hairdresserId, weekday, startTime, endTime)
      VALUES (?, ?, ?, ?)`,
      [hairdresserId, weekday, startTime, endTime]
    );

    res.json({ message: "Schedule saved" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error saving schedule" });
  }
};

export const getSchedule = async (req: Request, res: Response) => {
  try {
    const { hairdresserId } = req.query;

    const [rows] = await db.query(
      `SELECT * FROM hairdresser_schedule WHERE hairdresserId = ?`,
      [hairdresserId]
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Error fetching schedule" });
  }
};

export const deleteAppointment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await db.query(
      "DELETE FROM appointments WHERE id = ?",
      [id]
    );

    res.json({ message: "Appointment deleted" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting appointment" });
  }
};

export const updateAppointment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      date,
      startTime,
      hairdresserId,
      serviceId
    } = req.body;

    // service duration
    const [serviceRows]: any = await db.query(
      "SELECT * FROM services WHERE id = ?",
      [serviceId]
    );

    if (serviceRows.length === 0) {
      return res.status(404).json({ message: "Service not found" });
    }

    const duration = serviceRows[0].durationMinutes;

    const start = new Date(`${date}T${startTime}`);
    const end = new Date(start.getTime() + duration * 60000);

    // ütközés (KIVÉVE saját foglalás)
    const [existing]: any = await db.query(
      `SELECT * FROM appointments 
       WHERE hairdresserId = ? AND date = ? AND id != ?`,
      [hairdresserId, date, id]
    );

    for (let appt of existing) {
      const existingStart = new Date(`${appt.date}T${appt.startTime}`);
      const existingEnd = new Date(`${appt.date}T${appt.endTime}`);

      if (start < existingEnd && end > existingStart) {
        return res.status(400).json({
          message: "Time slot not available"
        });
      }
    }

    const endTime = end.toTimeString().slice(0, 5);

    await db.query(
      `UPDATE appointments 
       SET date = ?, startTime = ?, endTime = ?, hairdresserId = ?, serviceId = ?
       WHERE id = ?`,
      [date, startTime, endTime, hairdresserId, serviceId, id]
    );

    res.json({ message: "Appointment updated" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating appointment" });
  }
};

export const getHairdressers = async (_req: Request, res: Response) => {
  try {
    const [rows] = await db.query(
      "SELECT id, name FROM hairdressers"
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching hairdressers" });
  }
};

export const getServices = async (_req: Request, res: Response) => {
  try {
    const [rows] = await db.query(
      "SELECT id, name, durationMinutes, priceEUR FROM services"
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching services" });
  }
};

