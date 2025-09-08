const db = require("../config/db");

// ✅ Create a booking
exports.createBooking = async (req, res) => {
  const {
    user_id,
    customer_name,
    customer_phone,
    alternate_phone,   
    customer_email,    
    customer_address,
    event_details,
    notes,             
    rent,
    advance_paid,
    from_datetime,
    to_datetime,
    event_date_tamil,
    tamil_month,
    event_day,
    event_date_from,
    event_date_to,
  } = req.body;

  try {
    // Check if slot already booked
    const [existing] = await db.query(
      `SELECT * FROM bookings 
       WHERE status = 'booked'
       AND NOT (to_datetime <= ? OR from_datetime >= ?)`,
      [from_datetime, to_datetime]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "This time slot is already booked." });
    }

    // Insert booking
    const [result] = await db.query(
      `INSERT INTO bookings 
      (user_id, customer_name, customer_phone, alternate_phone, customer_email, customer_address,
       event_details, notes, rent, advance_paid, from_datetime, to_datetime,
       event_date_tamil, tamil_month, event_day, event_date_from, event_date_to) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        customer_name,
        customer_phone,
        alternate_phone || null,
        customer_email || null,
        customer_address,
        event_details,
        notes || null,
        rent,
        advance_paid,
        from_datetime,
        to_datetime,
        event_date_tamil || null,
        tamil_month || null,
        event_day || null,
        event_date_from || null,
        event_date_to || null,
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

// ✅ Update booking
exports.updateBooking = async (req, res) => {
  const { id } = req.params;
  const {
    user_id,
    customer_name,
    customer_phone,
    alternate_phone,
    customer_email,
    customer_address,
    event_details,
    notes,
    rent,
    advance_paid,
    from_datetime,
    to_datetime,
    event_date_tamil,
    tamil_month,
    event_day,
    event_date_from,
    event_date_to,
  } = req.body;

  try {
    await db.query(
      `UPDATE bookings 
       SET customer_name=?, customer_phone=?, alternate_phone=?, customer_email=?, customer_address=?,
           event_details=?, notes=?, rent=?, advance_paid=?, from_datetime=?, to_datetime=?,
           event_date_tamil=?, tamil_month=?, event_day=?, event_date_from=?, event_date_to=? 
       WHERE id=?`,
      [
        customer_name,
        customer_phone,
        alternate_phone || null,
        customer_email || null,
        customer_address,
        event_details,
        notes || null,
        rent,
        advance_paid,
        from_datetime,
        to_datetime,
        event_date_tamil || null,
        tamil_month || null,
        event_day || null,
        event_date_from || null,
        event_date_to || null,
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
// ✅ Get booking history (all bookings, all changes)
exports.getBookingHistory = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT 
          bh.id AS history_id,
          bh.booking_id,
          bh.action,
          bh.change_notes,
          bh.changed_at,
          u.name AS changed_by_name,
          b.customer_name,
          b.customer_phone,
          b.customer_email,
          b.customer_address,
          b.event_details,
          b.notes,
          b.rent,
          b.advance_paid,
          (b.rent - b.advance_paid) AS balance,
          b.from_datetime,
          b.to_datetime,
          b.event_date_english,
          b.event_date_tamil,
          b.tamil_month,
          b.event_day,
          b.event_date_from,
          b.event_date_to,
          b.status
       FROM booking_history bh
       LEFT JOIN users u ON bh.changed_by = u.id
       LEFT JOIN bookings b ON bh.booking_id = b.id
       ORDER BY bh.booking_id, bh.changed_at ASC`
    );

    // Group by booking_id
    const grouped = rows.reduce((acc, row) => {
      if (!acc[row.booking_id]) {
        acc[row.booking_id] = {
          booking: {
            booking_id: row.booking_id,
            customer_name: row.customer_name,
            customer_phone: row.customer_phone,
            customer_email: row.customer_email,
            customer_address: row.customer_address,
            event_details: row.event_details,
            notes: row.notes,
            rent: row.rent,
            advance_paid: row.advance_paid,
            balance: row.balance,
            from_datetime: row.from_datetime,
            to_datetime: row.to_datetime,
            event_date_english: row.event_date_english,
            event_date_tamil: row.event_date_tamil,
            tamil_month: row.tamil_month,
            event_day: row.event_day,
            event_date_from: row.event_date_from,
            event_date_to: row.event_date_to,
            status: row.status,
          },
          history: [],
        };
      }

      acc[row.booking_id].history.push({
        history_id: row.history_id,
        action: row.action,
        change_notes: row.change_notes,
        changed_at: row.changed_at,
        changed_by: row.changed_by_name,
      });

      return acc;
    }, {});

    res.json(Object.values(grouped));
  } catch (error) {
    console.error("Get Booking History Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// ✅ Get booking history for a specific user (their timeline)
exports.getUserBookingHistory = async (req, res) => {
  const { userId } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT 
          bh.id AS history_id,
          bh.booking_id,
          bh.action,
          bh.change_notes,
          bh.changed_at,
          u.name AS changed_by_name,
          b.customer_name,
          b.customer_phone,
          b.customer_email,
          b.customer_address,
          b.event_details,
          b.notes,
          b.rent,
          b.advance_paid,
          (b.rent - b.advance_paid) AS balance,
          b.from_datetime,
          b.to_datetime,
          b.event_date_english,
          b.event_date_tamil,
          b.tamil_month,
          b.event_day,
          b.event_date_from,
          b.event_date_to,
          b.status
       FROM booking_history bh
       LEFT JOIN users u ON bh.changed_by = u.id
       LEFT JOIN bookings b ON bh.booking_id = b.id
       WHERE b.user_id = ?
       ORDER BY bh.booking_id, bh.changed_at ASC`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "No booking history found for this user" });
    }

    const grouped = rows.reduce((acc, row) => {
      if (!acc[row.booking_id]) {
        acc[row.booking_id] = {
          booking: {
            booking_id: row.booking_id,
            customer_name: row.customer_name,
            customer_phone: row.customer_phone,
            customer_email: row.customer_email,
            customer_address: row.customer_address,
            event_details: row.event_details,
            notes: row.notes,
            rent: row.rent,
            advance_paid: row.advance_paid,
            balance: row.balance,
            from_datetime: row.from_datetime,
            to_datetime: row.to_datetime,
            event_date_english: row.event_date_english,
            event_date_tamil: row.event_date_tamil,
            tamil_month: row.tamil_month,
            event_day: row.event_day,
            event_date_from: row.event_date_from,
            event_date_to: row.event_date_to,
            status: row.status,
          },
          history: [],
        };
      }

      acc[row.booking_id].history.push({
        history_id: row.history_id,
        action: row.action,
        change_notes: row.change_notes,
        changed_at: row.changed_at,
        changed_by: row.changed_by_name,
      });

      return acc;
    }, {});

    res.json(Object.values(grouped));
  } catch (error) {
    console.error("Get User Booking History Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// ✅ Get booking by ID
exports.getBookingById = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT * FROM bookings WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Get Booking By ID Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
