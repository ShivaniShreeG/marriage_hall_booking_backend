const db = require("../config/db");

// ✅ Create a booking
exports.createBooking = async (req, res) => {
  const {
    user_id,
    customer_name,
    customer_phone,
    alternate_phone,   // ✅ Optional
    customer_email,    // ✅ Optional
    customer_address,
    event_details,
    notes,             // ✅ Optional
    advance_paid,
    from_datetime,
    to_datetime,
  } = req.body;

  try {
    // Check if slot already booked
    const [existing] = await db.query(
      "SELECT * FROM bookings WHERE status = 'booked' AND (from_datetime < ? AND to_datetime > ?)",
      [to_datetime, from_datetime]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "This time slot is already booked." });
    }

    // Insert booking (✅ Handle optional fields)
    const [result] = await db.query(
      `INSERT INTO bookings 
      (user_id, customer_name, customer_phone, alternate_phone, customer_email, customer_address,
       event_details, notes, advance_paid, from_datetime, to_datetime) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        customer_name,
        customer_phone,
        alternate_phone || null,  // ✅ Optional
        customer_email || null,   // ✅ Optional
        customer_address,
        event_details,
        notes || null,            // ✅ Optional
        advance_paid,
        from_datetime,
        to_datetime,
      ]
    );

    // Add history
    await db.query(
      "INSERT INTO booking_history (booking_id, changed_by, action, change_notes) VALUES (?, ?, 'created', ?)",
      [result.insertId, user_id, "Booking created"]
    );

    res.status(201).json({ message: "Booking created successfully", booking_id: result.insertId });
  } catch (error) {
    console.error("Create Booking Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get all bookings
exports.getBookings = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM bookings ORDER BY from_datetime ASC");
    res.json(rows);
  } catch (error) {
    console.error("Get Bookings Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Update booking details
exports.updateBooking = async (req, res) => {
  const { id } = req.params;
  const {
    user_id,
    customer_name,
    customer_phone,
    alternate_phone,   // ✅ Optional
    customer_email,    // ✅ Optional
    customer_address,
    event_details,
    notes,             // ✅ Optional
    advance_paid,
    from_datetime,
    to_datetime,
  } = req.body;

  try {
    // Update booking (✅ Handle optional fields)
    await db.query(
      `UPDATE bookings 
      SET customer_name=?, customer_phone=?, alternate_phone=?, customer_email=?, customer_address=?,
          event_details=?, notes=?, advance_paid=?, from_datetime=?, to_datetime=? 
      WHERE id=?`,
      [
        customer_name,
        customer_phone,
        alternate_phone || null, // ✅ Optional
        customer_email || null,  // ✅ Optional
        customer_address,
        event_details,
        notes || null,           // ✅ Optional
        advance_paid,
        from_datetime,
        to_datetime,
        id,
      ]
    );

    // Add history
    await db.query(
      "INSERT INTO booking_history (booking_id, changed_by, action, change_notes) VALUES (?, ?, 'updated', ?)",
      [id, user_id, "Booking updated"]
    );

    res.json({ message: "Booking updated successfully" });
  } catch (error) {
    console.error("Update Booking Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Cancel booking
exports.cancelBooking = async (req, res) => {
  const { id } = req.params;
  const { user_id, notes } = req.body;

  try {
    await db.query("UPDATE bookings SET status='cancelled' WHERE id=?", [id]);

    // Add history
    await db.query(
      "INSERT INTO booking_history (booking_id, changed_by, action, change_notes) VALUES (?, ?, 'cancelled', ?)",
      [id, user_id, notes || "Booking cancelled"]
    );

    res.json({ message: "Booking cancelled successfully" });
  } catch (error) {
    console.error("Cancel Booking Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
