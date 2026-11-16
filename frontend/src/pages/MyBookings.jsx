import { useState } from "react";

function MyBookings() {
  // Temporary demo data — we'll connect this to the backend API later.
  const [bookings, setBookings] = useState([
    {
      _id: "1",
      service: "Plumbing",
      provider: "Rahul Kumar",
      date: "2026-11-20",
      time: "10:00 AM - 11:00 AM",
      address: "Vijayanagar, Mysuru",
      status: "pending",
    },
    {
      _id: "2",
      service: "AC Repair",
      provider: "Suresh",
      date: "2026-11-22",
      time: "02:00 PM - 03:00 PM",
      address: "Kuvempunagar, Mysuru",
      status: "accepted",
    },
  ]);

  const handleCancel = (bookingId) => {
    setBookings((previousBookings) =>
      previousBookings.map((booking) =>
        booking._id === bookingId
          ? { ...booking, status: "cancelled" }
          : booking
      )
    );
  };

  return (
    <div>
      <nav>
        <h2>🟠 LocalLoop</h2>
        <a href="/book-service">Book a Service</a>
      </nav>

      <main>
        <h1>My Bookings</h1>
        <p>View and manage your service bookings.</p>

        {bookings.length === 0 ? (
          <p>You have no bookings yet.</p>
        ) : (
          bookings.map((booking) => (
            <div key={booking._id}>
              <h2>{booking.service}</h2>

              <p>Provider: {booking.provider}</p>
              <p>Date: {booking.date}</p>
              <p>Time: {booking.time}</p>
              <p>Address: {booking.address}</p>
              <p>
                Status: <strong>{booking.status.toUpperCase()}</strong>
              </p>

              {(booking.status === "pending" ||
                booking.status === "accepted") && (
                <button onClick={() => handleCancel(booking._id)}>
                  Cancel Booking
                </button>
              )}

              <hr />
            </div>
          ))
        )}
      </main>
    </div>
  );
}

export default MyBookings;