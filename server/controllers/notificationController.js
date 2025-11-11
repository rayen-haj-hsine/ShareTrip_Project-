import {
  getUnreadNotificationsForUser,
  markAllNotificationsReadForUser
} from "../models/notificationModel.js";

export const myNotifications = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const list = await getUnreadNotificationsForUser(userId);
    res.json(list);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const markAllRead = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const count = await markAllNotificationsReadForUser(userId);
    res.json({ updated: count });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};