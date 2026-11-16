import { useState } from "react";

function MyBookings() {

  // Temporary data until backend API integration
  const [bookings, setBookings] = useState([
    {
      id: 1,
      service: "Electrical Repair",
      provider: "Rahul Kumar",
      location: "Vijayanagar, Mysore",
      date: "2026-11-18",
      time: "10:00 AM - 11:00 AM",
      price: 500,
      status: "pending",
    },
    {
      id: 2,
      service: "Plumbing Service",
      provider: "Arun Kumar",
      location: "Hebbal, Mysore",
      date: "2026-11-19",
      time: "02:00 PM - 03:00 PM",
      price: 400,
      status: "accepted",
    },
    {
      id: 3,
      service: "AC Repair",
      provider: "Manoj Sharma",
      location: "Kuvempunagar, Mysore",
      date: "2026-11-12",
      time: "11:00 AM - 12:00 PM",
      price: 800,
      status: "completed",
    },
  ]);

  const handleCancel = (id) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this booking?"
    );

    if (!confirmCancel) return;

    setBookings((prev) =>
      prev.map((booking) =>
        booking.id === id &&
        ["pending", "accepted"].includes(booking.status)
          ? { ...booking, status: "cancelled" }
          : booking
      )
    );
  };

  return (
    <div className="dashboard-page">

      {/* Navbar */}
      <nav className="navbar">
        <h2>🟠 LocalLoop</h2>

        <div className="nav-links">
          <a href="/">Home</a>
          <a href="/book-service">Services</a>
          <a href="/my-bookings">My Bookings</a>
          <a href="/provider-bookings">Provider Dashboard</a>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="breadcrumb">
        Home / My Bookings
      </div>

      {/* Main Content */}
      <main className="dashboard-content">

        <div className="dashboard-heading">
          <h1>My Bookings</h1>
          <p>Track and manage all your service bookings.</p>
        </div>

        {/* Booking List */}
        <div className="booking-list">

          {bookings.length === 0 ? (
            <p>You haven't made any bookings yet.</p>
          ) : (

            bookings.map((booking) => (

              <div className="booking-card" key={booking.id}>

                <div className="booking-card-header">
                  <h2>{booking.service}</h2>

                  <span className={`status ${booking.status}`}>
                    {booking.status.toUpperCase()}
                  </span>
                </div>

                <div className="booking-details">

                  <p>
                    <strong>Provider:</strong> {booking.provider}
                  </p>

                  <p>
                    <strong>Location:</strong> {booking.location}
                  </p>

                  <p>
                    <strong>Date:</strong> {booking.date}
                  </p>

                  <p>
                    <strong>Time:</strong> {booking.time}
                  </p>

                  <p>
                    <strong>Price:</strong> ₹{booking.price}
                  </p>

                </div>

                <div className="booking-actions">

                  {["pending", "accepted"].includes(booking.status) && (
                    <button
                      onClick={() => handleCancel(booking.id)}
                    >
                      Cancel Booking
                    </button>
                  )}

                  {booking.status === "completed" && (
                    <button>
                      Leave a Review
                    </button>
                  )}

                </div>

              </div>

            ))

          )}

        </div>

      </main>

    </div>
  );
}

export default MyBookings;