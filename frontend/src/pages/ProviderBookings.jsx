import { useState } from "react";

function ProviderBookings() {
  // Temporary demo data — backend integration comes later.
  const [bookings, setBookings] = useState([
    {
      _id: "1",
      customer: "Ananya",
      service: "Plumbing",
      date: "2026-11-20",
      time: "10:00 AM - 11:00 AM",
      address: "Vijayanagar, Mysuru",
      status: "pending",
    },
    {
      _id: "2",
      customer: "Rahul",
      service: "Pipe Repair",
      date: "2026-11-21",
      time: "02:00 PM - 03:00 PM",
      address: "Kuvempunagar, Mysuru",
      status: "pending",
    },
  ]);

  const handleStatusChange = (bookingId, newStatus) => {
    setBookings((previousBookings) =>
      previousBookings.map((booking) =>
        booking._id === bookingId
          ? { ...booking, status: newStatus }
          : booking
      )
    );
  };

  return (
    <div>
      <nav>
        <h2>🟠 LocalLoop</h2>
        <a href="/book-service">Home</a>
        <a href="/my-bookings">Customer Bookings</a>
      </nav>

      <main>
        <h1>Provider Dashboard</h1>
        <p>Manage incoming service requests.</p>

        {bookings.length === 0 ? (
          <p>No booking requests available.</p>
        ) : (
          bookings.map((booking) => (
            <div key={booking._id}>
              <h2>{booking.service}</h2>

              <p>Customer: {booking.customer}</p>
              <p>Date: {booking.date}</p>
              <p>Time: {booking.time}</p>
              <p>Address: {booking.address}</p>
              <p>
                Status: <strong>{booking.status.toUpperCase()}</strong>
              </p>

              {booking.status === "pending" && (
                <>
                  <button
                    onClick={() =>
                      handleStatusChange(booking._id, "accepted")
                    }
                  >
                    Accept
                  </button>

                  <button
                    onClick={() =>
                      handleStatusChange(booking._id, "rejected")
                    }
                  >
                    Reject
                  </button>
                </>
              )}

              <hr />
            </div>
          ))
        )}
      </main>
    </div>
  );
}

export default ProviderBookings;