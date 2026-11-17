
import { useState, useEffect, useMemo } from "react";
import {
  Search,
  Bell,
  MapPin,
  CalendarDays,
  Clock,
  ArrowUpRight,
  Star,
  ChevronRight,
  Scissors,
  Wrench,
  Sparkles,
  UserRound,
  Menu,
  X,
  Send,
  LoaderCircle
} from "lucide-react";

import api from "../services/api";
import Rating from "../components/Rating";

const categories = [
  { name: "Home Cleaning", icon: Sparkles },
  { name: "Plumbing", icon: Wrench },
  { name: "Beauty & Salon", icon: Scissors }
];

const getArray = (data, keys = []) => {
  if (Array.isArray(data)) return data;

  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
  }

  return [];
};

const getId = (value) => {
  if (!value) return "";
  return typeof value === "object" ? value._id || value.id || "" : value;
};

const getName = (value, fallback) => {
  if (!value) return fallback;
  if (typeof value === "string") return value;
  return value.name || value.businessName || value.title || fallback;
};

const formatDate = (date) => {
  if (!date) return "Date unavailable";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "Date unavailable";

  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
};

const getStatus = (status) =>
  String(status || "pending").toLowerCase();

const isUpcoming = (booking) => {
  const status = getStatus(booking.status);
  const date = new Date(booking.bookingDate);

  return (
    ["pending", "accepted"].includes(status) &&
    !Number.isNaN(date.getTime()) &&
    date >= new Date(new Date().setHours(0, 0, 0, 0))
  );
};

const getBookingDetails = (booking) => ({
  id: booking._id || booking.id,
  service: getName(booking.serviceId || booking.service, "Local Service"),
  provider: getName(booking.providerId || booking.provider, "Service Provider"),
  date: formatDate(booking.bookingDate || booking.date),
  time: booking.timeSlot || booking.time || "Time unavailable",
  status: getStatus(booking.status),
  price:
    booking.totalAmount != null
      ? `₹${booking.totalAmount}`
      : booking.price != null
        ? `₹${booking.price}`
        : "Price unavailable",
  icon: Sparkles,
  original: booking
});

function CustomerDashboard() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");

  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);

  const [loadingBookings, setLoadingBookings] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);

  const [error, setError] = useState("");

  const [reviewBooking, setReviewBooking] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");

  const navigation = [
    "Dashboard",
    "My Bookings",
    "My Reviews",
    "Profile"
  ];

  const fetchBookings = async () => {
    try {
      setLoadingBookings(true);

      const response = await api.get("/bookings/my");

      const data = getArray(response.data, [
        "bookings",
        "data",
        "results"
      ]);

      setBookings(data);
      setError("");
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
      setError(
        err.response?.data?.message ||
        "Unable to load bookings. Please try again."
      );
    } finally {
      setLoadingBookings(false);
    }
  };

  const fetchReviews = async () => {
    try {
      setLoadingReviews(true);

      const response = await api.get("/reviews/my");

      const data = getArray(response.data, [
        "reviews",
        "data",
        "results"
      ]);

      setReviews(data);
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchReviews();
  }, []);

  const formattedBookings = useMemo(
    () => bookings.map(getBookingDetails),
    [bookings]
  );

  const upcomingBookings = formattedBookings.filter(isUpcoming);

  const completedBookings = formattedBookings.filter(
    (booking) => getStatus(booking.status) === "completed"
  );

  const reviewedBookingIds = new Set(
    reviews.map((review) => getId(review.booking))
  );

  const eligibleBookings = completedBookings.filter(
    (booking) => !reviewedBookingIds.has(booking.id)
  );

  const filteredBookings = formattedBookings.filter((booking) =>
    `${booking.service} ${booking.provider}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const submitReview = async (event) => {
    event.preventDefault();

    if (!reviewBooking) return;

    if (comment.trim().length < 5) {
      setReviewMessage("Please write at least 5 characters.");
      return;
    }

    try {
      setSubmitting(true);
      setReviewMessage("");

      const booking = reviewBooking.original;

      const providerId = getId(
        booking.providerId || booking.provider
      );

      await api.post("/reviews", {
        provider: providerId,
        booking: reviewBooking.id,
        rating,
        comment: comment.trim()
      });

      setReviewMessage("Review submitted successfully.");
      setComment("");
      setRating(5);
      setReviewBooking(null);

      await Promise.all([fetchReviews(), fetchBookings()]);
    } catch (err) {
      setReviewMessage(
        err.response?.data?.message ||
        "Unable to submit review. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const renderBookingCard = (booking, showDate = true) => {
    const BookingIcon = booking.icon;

    return (
      <article className="customer-booking-card" key={booking.id}>
        <div className="customer-booking-icon">
          <BookingIcon size={23} />
        </div>

        <div className="customer-booking-info">
          <span className="customer-booking-id">
            {String(booking.id).slice(-8)}
          </span>
          <h3>{booking.service}</h3>
          <p>{booking.provider}</p>
        </div>

        {showDate && (
          <>
            <div className="customer-booking-date">
              <CalendarDays size={16} />
              <span>{booking.date}</span>
            </div>

            <div className="customer-booking-time">
              <Clock size={16} />
              <span>{booking.time}</span>
            </div>
          </>
        )}

        <div className="customer-booking-end">
          <span className={`customer-status ${booking.status}`}>
            {booking.status}
          </span>
          <strong>{booking.price}</strong>
        </div>
      </article>
    );
  };

  return (
    <div className="customer-layout">
      <aside className={`customer-sidebar ${menuOpen ? "open" : ""}`}>
        <div className="customer-brand">
          <div className="customer-brand-icon">L</div>
          <div>
            <h2>LocalLoop</h2>
            <span>YOUR LOCAL SERVICES</span>
          </div>

          <button
            className="customer-close-menu"
            onClick={() => setMenuOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <div className="customer-nav-label">MENU</div>

        <nav className="customer-navigation">
          {navigation.map((item) => (
            <button
              key={item}
              className={`customer-nav-item ${
                activeTab === item ? "active" : ""
              }`}
              onClick={() => {
                setActiveTab(item);
                setMenuOpen(false);
              }}
            >
              {item === "Dashboard" && <CalendarDays size={19} />}
              {item === "My Bookings" && <Clock size={19} />}
              {item === "My Reviews" && <Star size={19} />}
              {item === "Profile" && <UserRound size={19} />}
              <span>{item}</span>
            </button>
          ))}
        </nav>

        <div className="customer-sidebar-bottom">
          <div className="customer-help-card">
            <h4>Need assistance?</h4>
            <p>We're here to help with your bookings.</p>
            <button onClick={() => alert("Support section coming soon.")}>
              Contact Support
              <ArrowUpRight size={15} />
            </button>
          </div>

          <div className="customer-profile-mini">
            <div className="customer-avatar">C</div>
            <div>
              <strong>Customer</strong>
              <span>Customer account</span>
            </div>
          </div>
        </div>
      </aside>

      {menuOpen && (
        <div
          className="customer-overlay"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <main className="customer-main">
        <header className="customer-header">
          <div className="customer-header-left">
            <button
              className="customer-menu-button"
              onClick={() => setMenuOpen(true)}
            >
              <Menu size={22} />
            </button>

            <div>
              <span className="customer-breadcrumb">
                CUSTOMER PORTAL / {activeTab.toUpperCase()}
              </span>
              <h3>{activeTab}</h3>
            </div>
          </div>

          <div className="customer-header-actions">
            <div className="customer-location">
              <MapPin size={16} />
              <span>Mysuru, Karnataka</span>
            </div>

            <button
              className="customer-notification"
              aria-label="Notifications"
              onClick={() => alert("No new notifications.")}
            >
              <Bell size={19} />
              <span />
            </button>
          </div>
        </header>

        {activeTab === "Dashboard" && (
          <div className="customer-content">
            <section className="customer-welcome">
              <div>
                <span className="customer-eyebrow">
                  YOUR LOCAL SERVICES, SIMPLIFIED
                </span>
                <h1>
                  Welcome back<span>.</span>
                </h1>
                <p>
                  Manage your bookings and discover trusted services
                  around you.
                </p>
              </div>

              <div className="customer-welcome-decoration">
                <div className="welcome-decoration-circle">
                  <MapPin size={34} />
                </div>
              </div>
            </section>

            {error && (
              <div className="customer-empty-state">
                {error}
                <button onClick={fetchBookings}>Retry</button>
              </div>
            )}

            <section className="customer-stats">
              <div className="customer-stat-card">
                <div className="customer-stat-icon yellow">
                  <CalendarDays size={21} />
                </div>
                <span>Total Bookings</span>
                <h2>{loadingBookings ? "—" : bookings.length}</h2>
                <small>All time bookings</small>
              </div>

              <div className="customer-stat-card">
                <div className="customer-stat-icon green">
                  <Clock size={21} />
                </div>
                <span>Upcoming</span>
                <h2>{loadingBookings ? "—" : upcomingBookings.length}</h2>
                <small>Scheduled services</small>
              </div>

              <div className="customer-stat-card">
                <div className="customer-stat-icon purple">
                  <Star size={21} />
                </div>
                <span>Reviews Given</span>
                <h2>{loadingReviews ? "—" : reviews.length}</h2>
                <small>Your feedback matters</small>
              </div>
            </section>

            <section className="customer-section-heading">
              <div>
                <h2>Upcoming bookings</h2>
                <p>Keep track of your scheduled services.</p>
              </div>

              <button
                className="customer-view-all"
                onClick={() => setActiveTab("My Bookings")}
              >
                View all <ChevronRight size={17} />
              </button>
            </section>

            <section className="customer-booking-list">
              {loadingBookings ? (
                <div className="customer-empty-state">
                  Loading bookings...
                </div>
              ) : upcomingBookings.length > 0 ? (
                upcomingBookings.map((booking) =>
                  renderBookingCard(booking)
                )
              ) : (
                <div className="customer-empty-state">
                  You don't have any upcoming bookings.
                </div>
              )}
            </section>

            <section className="customer-section-heading category-heading">
              <div>
                <h2>Explore services</h2>
                <p>Find the right professional for your needs.</p>
              </div>
            </section>

            <section className="customer-category-grid">
              {categories.map((category) => {
                const CategoryIcon = category.icon;

                return (
                  <button
                    className="customer-category-card"
                    key={category.name}
                    onClick={() =>
                      alert(`${category.name} search will be connected soon.`)
                    }
                  >
                    <div>
                      <CategoryIcon size={22} />
                    </div>
                    <strong>{category.name}</strong>
                    <ArrowUpRight size={17} />
                  </button>
                );
              })}
            </section>

            <footer className="customer-footer">
              © 2026 LocalLoop. Connecting you with trusted local services.
            </footer>
          </div>
        )}

        {activeTab === "My Bookings" && (
          <div className="customer-content">
            <section className="customer-section-heading">
              <div>
                <h2>Your bookings</h2>
                <p>View and manage your service appointments.</p>
              </div>
            </section>

            <div className="customer-booking-search">
              <Search size={18} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search services or providers..."
              />
            </div>

            <section className="customer-booking-list">
              {loadingBookings ? (
                <div className="customer-empty-state">
                  Loading bookings...
                </div>
              ) : filteredBookings.length > 0 ? (
                filteredBookings.map((booking) =>
                  renderBookingCard(booking, false)
                )
              ) : (
                <div className="customer-empty-state">
                  No bookings match your search.
                </div>
              )}
            </section>
          </div>
        )}

        {activeTab === "My Reviews" && (
          <div className="customer-content">
            <section className="customer-section-heading">
              <div>
                <h2>Your reviews</h2>
                <p>Feedback you've shared with local professionals.</p>
              </div>
            </section>

            {reviewMessage && (
              <div className="customer-empty-state">
                {reviewMessage}
              </div>
            )}

            <section className="customer-booking-list">
              <h3>Bookings waiting for your review</h3>

              {loadingBookings || loadingReviews ? (
                <div className="customer-empty-state">
                  Loading...
                </div>
              ) : eligibleBookings.length > 0 ? (
                eligibleBookings.map((booking) => (
                  <article
                    className="customer-booking-card"
                    key={booking.id}
                  >
                    <div className="customer-booking-info">
                      <h3>{booking.service}</h3>
                      <p>{booking.provider}</p>
                      <small>{booking.date}</small>
                    </div>

                    <button
                      className="customer-view-all"
                      onClick={() => {
                        setReviewBooking(booking);
                        setRating(5);
                        setComment("");
                        setReviewMessage("");
                      }}
                    >
                      Write review <ChevronRight size={17} />
                    </button>
                  </article>
                ))
              ) : (
                <div className="customer-empty-state">
                  No completed bookings are waiting for a review.
                </div>
              )}
            </section>

            {reviewBooking && (
              <form
                className="customer-empty-state"
                onSubmit={submitReview}
              >
                <h3>Review {reviewBooking.service}</h3>
                <p>{reviewBooking.provider}</p>

                <Rating
                  value={rating}
                  onChange={setRating}
                  size={25}
                />

                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience (5–1000 characters)"
                  minLength={5}
                  maxLength={1000}
                  required
                  rows={4}
                />

                <button type="submit" disabled={submitting}>
                  {submitting ? (
                    <LoaderCircle size={17} />
                  ) : (
                    <Send size={17} />
                  )}
                  {submitting ? "Submitting..." : "Submit review"}
                </button>

                <button
                  type="button"
                  onClick={() => setReviewBooking(null)}
                >
                  Cancel
                </button>
              </form>
            )}

            <section className="customer-booking-list">
              <h3>Your submitted reviews</h3>

              {loadingReviews ? (
                <div className="customer-empty-state">
                  Loading reviews...
                </div>
              ) : reviews.length > 0 ? (
                reviews.map((review) => (
                  <article
                    className="customer-booking-card"
                    key={review._id}
                  >
                    <div className="customer-booking-icon">
                      <Star size={21} />
                    </div>

                    <div className="customer-booking-info">
                      <h3>
                        {getName(review.provider, "Service Provider")}
                      </h3>
                      <Rating value={review.rating} readOnly size={17} />
                      <p>{review.comment}</p>
                      <small>
                        {formatDate(review.createdAt)}
                      </small>
                    </div>
                  </article>
                ))
              ) : (
                <div className="customer-empty-state">
                  You haven't submitted any reviews yet.
                </div>
              )}
            </section>
          </div>
        )}

        {activeTab === "Profile" && (
          <div className="customer-content">
            <section className="customer-section-heading">
              <div>
                <h2>Your profile</h2>
                <p>Manage your personal account information.</p>
              </div>
            </section>

            <div className="customer-empty-state">
              Profile editing will be connected to the Authentication API.
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default CustomerDashboard;
  