
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  Star,
  Wallet,
  Settings,
  LogOut,
  Bell,
  Menu,
  X,
  Clock,
  ArrowUpRight,
  TrendingUp,
  IndianRupee,
  MapPin
} from "lucide-react";

import api from "../services/api";
import Rating from "../components/Rating";

const initialRequests = [
  {
    id: "LL-2031",
    customer: "Ananya Sharma",
    service: "Deep Home Cleaning",
    date: "Nov 16, 2026",
    time: "10:00 AM",
    location: "Vijayanagar, Mysuru",
    amount: 1500,
    status: "Pending"
  },
  {
    id: "LL-2032",
    customer: "Rohit Kumar",
    service: "Bathroom Plumbing",
    date: "Nov 17, 2026",
    time: "02:30 PM",
    location: "Hebbal, Mysuru",
    amount: 800,
    status: "Pending"
  },
  {
    id: "LL-2033",
    customer: "Meera Rao",
    service: "Kitchen Cleaning",
    date: "Nov 18, 2026",
    time: "11:00 AM",
    location: "Kuvempunagar, Mysuru",
    amount: 1200,
    status: "Pending"
  }
];

const initialAppointments = [
  {
    id: "LL-2024",
    customer: "Kavya R",
    service: "Full Home Cleaning",
    date: "Nov 15, 2026",
    time: "09:00 AM",
    amount: 2000,
    status: "Confirmed"
  },
  {
    id: "LL-2025",
    customer: "Arjun M",
    service: "Kitchen Cleaning",
    date: "Nov 16, 2026",
    time: "02:00 PM",
    amount: 1000,
    status: "Confirmed"
  }
];

const navigation = [
  { name: "Overview", icon: LayoutDashboard },
  { name: "Requests", icon: ClipboardList },
  { name: "Appointments", icon: CalendarDays },
  { name: "Earnings", icon: Wallet },
  { name: "Reviews", icon: Star },
  { name: "Settings", icon: Settings }
];

// Try to find the logged-in user's ID in common localStorage user objects.
function getProviderId() {
  const possibleKeys = [
    "user",
    "currentUser",
    "authUser",
    "profile",
    "provider",
    "auth"
  ];

  for (const key of possibleKeys) {
    try {
      const storedValue = localStorage.getItem(key);
      if (!storedValue) continue;

      const parsed = JSON.parse(storedValue);

      const candidates = [
        parsed?._id,
        parsed?.id,
        parsed?.userId,
        parsed?.providerId,
        parsed?.user?._id,
        parsed?.user?.id,
        parsed?.user?.userId,
        parsed?.data?._id,
        parsed?.data?.id,
        parsed?.data?.user?._id
      ];

      const found = candidates.find(
        (value) => typeof value === "string" && value.length > 0
      );

      if (found) return found;
    } catch {
      // Ignore values that are not JSON user objects.
    }
  }

  return null;
}

function ProviderDashboard() {
  const [activePage, setActivePage] = useState("Overview");
  const [menuOpen, setMenuOpen] = useState(false);
  const [requests, setRequests] = useState(initialRequests);
  const [appointments, setAppointments] = useState(initialAppointments);
  const [available, setAvailable] = useState(true);

  // Review states
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [ratingDistribution, setRatingDistribution] = useState({});
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState("");

  const [providerId] = useState(() => getProviderId());

  // Fetch actual provider reviews.
  useEffect(() => {
    const fetchReviews = async () => {
      if (!providerId) {
        setReviewsError(
          "Provider ID could not be found. Please check your login user data."
        );
        return;
      }

      try {
        setReviewsLoading(true);
        setReviewsError("");

        const response = await api.get(
          `/reviews/provider/${providerId}`
        );

        const data = response.data;

        const reviewList = Array.isArray(data)
          ? data
          : data.reviews || data.data || [];

        setReviews(reviewList);

        const calculatedAverage =
          reviewList.length > 0
            ? reviewList.reduce(
                (sum, review) => sum + Number(review.rating || 0),
                0
              ) / reviewList.length
            : 0;

        setAverageRating(
          Number(data.averageRating ?? calculatedAverage)
        );

        setTotalReviews(
          Number(data.totalReviews ?? reviewList.length)
        );

        if (data.ratingDistribution) {
          setRatingDistribution(data.ratingDistribution);
        } else {
          const distribution = {};

          [5, 4, 3, 2, 1].forEach((rating) => {
            distribution[rating] = reviewList.filter(
              (review) => Number(review.rating) === rating
            ).length;
          });

          setRatingDistribution(distribution);
        }
      } catch (error) {
        console.error("Error fetching provider reviews:", error);

        setReviewsError(
          error.response?.data?.message ||
            "Unable to load reviews. Please try again."
        );
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchReviews();
  }, [providerId]);

  const acceptRequest = (id) => {
    const selectedRequest = requests.find(
      (request) => request.id === id
    );

    if (!selectedRequest) return;

    setRequests((previous) =>
      previous.map((request) =>
        request.id === id
          ? { ...request, status: "Accepted" }
          : request
      )
    );

    setAppointments((previous) => [
      ...previous,
      {
        ...selectedRequest,
        status: "Confirmed"
      }
    ]);
  };

  const rejectRequest = (id) => {
    setRequests((previous) =>
      previous.map((request) =>
        request.id === id
          ? { ...request, status: "Rejected" }
          : request
      )
    );
  };

  const handleNavigation = (page) => {
    setActivePage(page);
    setMenuOpen(false);
  };

  const pendingRequests = requests.filter(
    (request) => request.status === "Pending"
  );

  const getDistributionCount = (rating) => {
    const value = ratingDistribution[rating];

    if (typeof value === "number") return value;
    if (value && typeof value.count === "number") return value.count;

    return 0;
  };

  const renderReviews = () => (
    <>
      <section className="provider-stats-grid">
        <div className="provider-stat-card">
          <div className="provider-stat-top">
            <span className="provider-stat-icon">
              <Star size={20} />
            </span>
          </div>
          <p>Average Rating</p>
          <h2>{averageRating.toFixed(1)} <span className="provider-out-of">/ 5</span></h2>
          <span className="provider-stat-note">Based on customer reviews</span>
        </div>

        <div className="provider-stat-card">
          <div className="provider-stat-top">
            <span className="provider-stat-icon">
              <ClipboardList size={20} />
            </span>
          </div>
          <p>Total Reviews</p>
          <h2>{totalReviews}</h2>
          <span className="provider-stat-note">Customer feedback received</span>
        </div>
      </section>

      <section className="provider-panel">
        <div className="provider-panel-header">
          <div>
            <h3>Rating Distribution</h3>
            <p>Breakdown of your customer ratings</p>
          </div>
        </div>

        <div className="provider-rating-distribution">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = getDistributionCount(rating);
            const percentage =
              totalReviews > 0 ? (count / totalReviews) * 100 : 0;

            return (
              <div className="provider-rating-row" key={rating}>
                <span>{rating} Star</span>
                <div className="provider-rating-bar">
                  <div
                    className="provider-rating-fill"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span>{count}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="provider-panel">
        <div className="provider-panel-header">
          <div>
            <h3>Customer Reviews</h3>
            <p>Feedback from customers who booked your services</p>
          </div>
          <span className="provider-count">
            {totalReviews} Reviews
          </span>
        </div>

        {reviewsLoading ? (
          <div className="provider-empty">
            <p>Loading customer reviews...</p>
          </div>
        ) : reviewsError ? (
          <div className="provider-empty">
            <h3>Unable to display reviews</h3>
            <p>{reviewsError}</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="provider-empty">
            <Star size={28} />
            <h3>No reviews yet</h3>
            <p>Customer reviews will appear here after they submit feedback.</p>
          </div>
        ) : (
          <div className="provider-review-list">
            {reviews.map((review) => (
              <article
                className="provider-review-item"
                key={review._id || review.id}
              >
                <div className="provider-review-header">
                  <div>
                    <h4>
                      {review.customer?.name ||
                        review.customerName ||
                        "Customer"}
                    </h4>
                    <span>
                      {review.createdAt
                        ? new Date(review.createdAt).toLocaleDateString(
                            "en-IN",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric"
                            }
                          )
                        : "Date unavailable"}
                    </span>
                  </div>

                  <Rating
                    value={Number(review.rating) || 0}
                    readOnly
                    size={17}
                  />
                </div>

                <p className="provider-review-comment">
                  {review.comment}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );

  const renderOverview = () => (
    <>
      <section className="provider-welcome">
        <div>
          <span className="provider-eyebrow">PROVIDER WORKSPACE</span>
          <h2>Welcome back, Rahul</h2>
          <p>Here's an overview of your service business.</p>
        </div>

        <div className="provider-availability">
          <span className={available ? "provider-online-dot" : "provider-offline-dot"} />
          <span>
            {available ? "Available for bookings" : "Currently unavailable"}
          </span>
          <button
            className={`provider-toggle ${available ? "active" : ""}`}
            onClick={() => setAvailable(!available)}
            aria-label="Toggle availability"
          >
            <span />
          </button>
        </div>
      </section>

      <section className="provider-stats-grid">
        <div className="provider-stat-card">
          <div className="provider-stat-top">
            <span className="provider-stat-icon"><IndianRupee size={20} /></span>
            <span className="provider-stat-change"><TrendingUp size={13} /> 12.5%</span>
          </div>
          <p>Total Earnings</p>
          <h2>₹24,500</h2>
          <span className="provider-stat-note">Compared to last month</span>
        </div>

        <div className="provider-stat-card">
          <div className="provider-stat-top">
            <span className="provider-stat-icon"><CalendarDays size={20} /></span>
            <span className="provider-stat-change"><TrendingUp size={13} /> 8.2%</span>
          </div>
          <p>Total Bookings</p>
          <h2>48</h2>
          <span className="provider-stat-note">All time bookings</span>
        </div>

        <div className="provider-stat-card">
          <div className="provider-stat-top">
            <span className="provider-stat-icon"><Clock size={20} /></span>
          </div>
          <p>Pending Requests</p>
          <h2>{pendingRequests.length}</h2>
          <span className="provider-stat-note">Requires your attention</span>
        </div>

        <div className="provider-stat-card">
          <div className="provider-stat-top">
            <span className="provider-stat-icon"><Star size={20} /></span>
            <span className="provider-rating">Customer rating</span>
          </div>
          <p>Average Rating</p>
          <h2>{averageRating.toFixed(1)} <span className="provider-out-of">/ 5</span></h2>
          <span className="provider-stat-note">Based on {totalReviews} reviews</span>
        </div>
      </section>

      <section className="provider-content-grid">
        <div className="provider-panel">
          <div className="provider-panel-header">
            <div>
              <h3>New Booking Requests</h3>
              <p>Review and respond to customer requests</p>
            </div>
            <button
              className="provider-text-button"
              onClick={() => handleNavigation("Requests")}
            >
              View all <ArrowUpRight size={15} />
            </button>
          </div>

          <div className="provider-request-list">
            {requests.slice(0, 3).map((request) => (
              <div className="provider-request" key={request.id}>
                <div className="provider-request-main">
                  <div className="provider-request-icon">
                    <ClipboardList size={20} />
                  </div>
                  <div>
                    <h4>{request.service}</h4>
                    <p>{request.customer} · {request.id}</p>
                    <span><CalendarDays size={13} /> {request.date} · {request.time}</span>
                  </div>
                </div>

                <div className="provider-request-bottom">
                  <strong>₹{request.amount.toLocaleString("en-IN")}</strong>
                  {request.status === "Pending" ? (
                    <div className="provider-request-actions">
                      <button
                        className="provider-reject-btn"
                        onClick={() => rejectRequest(request.id)}
                      >
                        Reject
                      </button>
                      <button
                        className="provider-accept-btn"
                        onClick={() => acceptRequest(request.id)}
                      >
                        Accept
                      </button>
                    </div>
                  ) : (
                    <span className={`provider-status ${request.status.toLowerCase()}`}>
                      {request.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="provider-panel">
          <div className="provider-panel-header">
            <div>
              <h3>Upcoming Appointments</h3>
              <p>Your next scheduled services</p>
            </div>
            <button
              className="provider-text-button"
              onClick={() => handleNavigation("Appointments")}
            >
              View all <ArrowUpRight size={15} />
            </button>
          </div>

          <div className="provider-appointment-list">
            {appointments.slice(0, 4).map((appointment) => (
              <div className="provider-appointment" key={appointment.id}>
                <div className="provider-date-box">
                  <span>{appointment.date.split(" ")[0].slice(0, 3)}</span>
                  <strong>{appointment.date.split(" ")[1].replace(",", "")}</strong>
                </div>
                <div className="provider-appointment-info">
                  <h4>{appointment.service}</h4>
                  <p>{appointment.customer}</p>
                  <span><Clock size={13} /> {appointment.time}</span>
                </div>
                <span className="provider-status confirmed">Confirmed</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="provider-panel provider-profile-panel">
        <div className="provider-panel-header">
          <div>
            <h3>Your Service Profile</h3>
            <p>How customers see your business</p>
          </div>
          <button
            className="provider-text-button"
            onClick={() => handleNavigation("Settings")}
          >
            Manage profile <ArrowUpRight size={15} />
          </button>
        </div>

        <div className="provider-business-info">
          <div className="provider-business-avatar">R</div>
          <div>
            <h4>Rahul Home Services</h4>
            <p><MapPin size={14} /> Mysuru, Karnataka</p>
            <span>Home Cleaning · Plumbing · Maintenance</span>
          </div>
          <div className="provider-business-rating">
            <Star size={16} fill="currentColor" />
            <strong>{averageRating.toFixed(1)}</strong>
            <span>{totalReviews} reviews</span>
          </div>
        </div>
      </section>
    </>
  );

  const renderRequests = () => (
    <section className="provider-panel">
      <div className="provider-panel-header">
        <div>
          <h3>Booking Requests</h3>
          <p>Accept or reject incoming customer requests</p>
        </div>
        <span className="provider-count">{pendingRequests.length} Pending</span>
      </div>

      <div className="provider-request-list">
        {requests.map((request) => (
          <div className="provider-request" key={request.id}>
            <div className="provider-request-main">
              <div className="provider-request-icon">
                <ClipboardList size={20} />
              </div>
              <div>
                <h4>{request.service}</h4>
                <p>{request.customer} · {request.id}</p>
                <span><CalendarDays size={13} /> {request.date} · {request.time}</span>
                <span><MapPin size={13} /> {request.location}</span>
              </div>
            </div>
            <div className="provider-request-bottom">
              <strong>₹{request.amount.toLocaleString("en-IN")}</strong>
              {request.status === "Pending" ? (
                <div className="provider-request-actions">
                  <button className="provider-reject-btn" onClick={() => rejectRequest(request.id)}>Reject</button>
                  <button className="provider-accept-btn" onClick={() => acceptRequest(request.id)}>Accept</button>
                </div>
              ) : (
                <span className={`provider-status ${request.status.toLowerCase()}`}>{request.status}</span>
              )}
            </div>
          </div>
        ))}

        {requests.length === 0 && (
          <div className="provider-empty">
            <ClipboardList size={28} />
            <h3>No booking requests</h3>
            <p>New customer requests will appear here.</p>
          </div>
        )}
      </div>
    </section>
  );

  const renderAppointments = () => (
    <section className="provider-panel">
      <div className="provider-panel-header">
        <div>
          <h3>My Appointments</h3>
          <p>Manage your confirmed service bookings</p>
        </div>
        <span className="provider-count">{appointments.length} Bookings</span>
      </div>

      <div className="provider-appointment-list">
        {appointments.map((appointment) => (
          <div className="provider-appointment" key={appointment.id}>
            <div className="provider-date-box">
              <span>{appointment.date.split(" ")[0].slice(0, 3)}</span>
              <strong>{appointment.date.split(" ")[1].replace(",", "")}</strong>
            </div>
            <div className="provider-appointment-info">
              <h4>{appointment.service}</h4>
              <p>{appointment.customer} · {appointment.id}</p>
              <span><Clock size={13} /> {appointment.time}</span>
            </div>
            <strong>₹{appointment.amount.toLocaleString("en-IN")}</strong>
            <span className="provider-status confirmed">Confirmed</span>
          </div>
        ))}
      </div>
    </section>
  );

  const renderPlaceholder = () => (
    <section className="provider-panel provider-placeholder">
      <div className="provider-empty">
        {activePage === "Earnings" && <Wallet size={30} />}
        {activePage === "Settings" && <Settings size={30} />}
        <h3>{activePage}</h3>
        <p>
          The {activePage.toLowerCase()} section will be implemented
          in the next development steps.
        </p>
      </div>
    </section>
  );

  return (
    <div className="provider-layout">
      {menuOpen && (
        <div
          className="provider-overlay"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <aside className={`provider-sidebar ${menuOpen ? "open" : ""}`}>
        <div className="provider-logo">
          <div className="provider-logo-icon">L</div>
          <div>
            <h2>LocalLoop</h2>
            <span>Provider Workspace</span>
          </div>
          <button
            className="provider-close-menu"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="provider-sidebar-label">MENU</div>

        <nav className="provider-nav">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.name}
                className={`provider-nav-item ${activePage === item.name ? "active" : ""}`}
                onClick={() => handleNavigation(item.name)}
              >
                <Icon size={19} />
                <span>{item.name}</span>
                {item.name === "Requests" && pendingRequests.length > 0 && (
                  <span className="provider-nav-count">{pendingRequests.length}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="provider-sidebar-bottom">
          <div className="provider-sidebar-profile">
            <div className="provider-avatar">R</div>
            <div>
              <h4>Rahul Kumar</h4>
              <p>Service Provider</p>
            </div>
          </div>
          <button className="provider-nav-item provider-logout">
            <LogOut size={18} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      <main className="provider-main">
        <header className="provider-header">
          <div className="provider-header-left">
            <button
              className="provider-menu-button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={21} />
            </button>
            <div>
              <span className="provider-breadcrumb">Provider Workspace / {activePage}</span>
              <h1>{activePage}</h1>
            </div>
          </div>

          <div className="provider-header-actions">
            <button className="provider-notification" aria-label="Notifications">
              <Bell size={19} />
              <span />
            </button>
            <div className="provider-header-avatar">R</div>
          </div>
        </header>

        <div className="provider-page-content">
          {activePage === "Overview" && renderOverview()}
          {activePage === "Requests" && renderRequests()}
          {activePage === "Appointments" && renderAppointments()}
          {activePage === "Reviews" && renderReviews()}
          {["Earnings", "Settings"].includes(activePage) && renderPlaceholder()}
        </div>

        <footer className="provider-footer">
          <span>LocalLoop</span>
          <span>Provider Dashboard · Development Preview</span>
        </footer>
      </main>
    </div>
  );
}

export default ProviderDashboard;
