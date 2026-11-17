
import { useEffect, useMemo, useState } from "react";
import {
  Star,
  Search,
  MessageSquare,
  ThumbsUp,
  Filter,
  CalendarDays
} from "lucide-react";

import api from "../services/api";
import Rating from "../components/Rating";

function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch all platform reviews from the backend.
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/reviews");

        const data = response.data;

        const reviewList = Array.isArray(data)
          ? data
          : data.reviews || data.data || [];

        const formattedReviews = reviewList.map((review) => {
          const customer =
            typeof review.customer === "object"
              ? review.customer?.name
              : review.customerName;

          const provider =
            typeof review.provider === "object"
              ? review.provider?.name
              : review.providerName;

          const booking =
            typeof review.booking === "object"
              ? review.booking
              : {};

          const service =
            booking.serviceId?.name ||
            booking.serviceId?.title ||
            booking.service?.name ||
            review.serviceName ||
            review.service ||
            "Service";

          return {
            id: review._id || review.id,
            customer: customer || "Customer",
            provider: provider || "Provider",
            service:
              typeof service === "object"
                ? service.name || service.title || "Service"
                : service,
            rating: Number(review.rating) || 0,
            comment: review.comment || "",
            date: review.createdAt
              ? new Date(review.createdAt).toLocaleDateString(
                  "en-IN",
                  {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                  }
                )
              : "Date unavailable",
            status: "Published"
          };
        });

        setReviews(formattedReviews);
      } catch (err) {
        console.error("Error fetching admin reviews:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load reviews. The all-reviews API may not be available yet."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const averageRating =
    reviews.length > 0
      ? reviews.reduce(
          (total, review) => total + review.rating,
          0
        ) / reviews.length
      : 0;

  const positiveReviews = reviews.filter(
    (review) => review.rating >= 4
  ).length;

  const filteredReviews = useMemo(() => {
    return reviews.filter((review) => {
      const matchesSearch = [
        review.customer,
        review.service,
        review.provider,
        review.comment
      ]
        .join(" ")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesRating =
        ratingFilter === "All" ||
        review.rating === Number(ratingFilter);

      return matchesSearch && matchesRating;
    });
  }, [reviews, searchTerm, ratingFilter]);

  const ratingCounts = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter(
      (review) => review.rating === rating
    ).length
  }));

  return (
    <div className="reviews-page">

      <section className="reviews-intro">
        <div>
          <h2>Customer Reviews</h2>
          <p>
            Monitor customer feedback and provider service quality.
          </p>
        </div>

        <div className="reviews-period">
          <CalendarDays size={16} />
          All time
        </div>
      </section>

      {loading ? (
        <section className="panel">
          <div className="empty-state">
            <p>Loading customer reviews...</p>
          </div>
        </section>
      ) : error ? (
        <section className="panel">
          <div className="empty-state">
            <MessageSquare size={28} />
            <h3>Unable to load reviews</h3>
            <p>{error}</p>
          </div>
        </section>
      ) : (
        <>
          <section className="review-summary-grid">

            <div className="review-summary-card average-rating-card">
              <div className="summary-icon">
                <Star size={20} />
              </div>

              <p>Average Rating</p>

              <div className="average-rating-value">
                {averageRating.toFixed(1)}
                <span>/ 5</span>
              </div>

              <Rating
                value={averageRating}
                readOnly
                size={15}
              />

              <small>Across {reviews.length} reviews</small>
            </div>

            <div className="review-summary-card">
              <div className="summary-icon">
                <MessageSquare size={20} />
              </div>

              <p>Total Reviews</p>
              <h3>{reviews.length}</h3>
              <small>Customer feedback entries</small>
            </div>

            <div className="review-summary-card">
              <div className="summary-icon">
                <ThumbsUp size={20} />
              </div>

              <p>Positive Reviews</p>
              <h3>{positiveReviews}</h3>
              <small>Ratings of 4 stars and above</small>
            </div>

          </section>

          <section className="panel rating-distribution">

            <div className="panel-header">
              <div>
                <h2>Rating Distribution</h2>
                <p>Breakdown of customer ratings</p>
              </div>
            </div>

            <div className="rating-bars">
              {ratingCounts.map(({ rating, count }) => {
                const percentage =
                  reviews.length > 0
                    ? (count / reviews.length) * 100
                    : 0;

                return (
                  <div className="rating-bar-row" key={rating}>
                    <span className="rating-label">
                      {rating} star
                    </span>

                    <div className="rating-track">
                      <div
                        className="rating-fill"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    <span className="rating-count">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>

          </section>

          <section className="panel all-reviews-panel">

            <div className="panel-header">
              <div>
                <h2>All Reviews</h2>
                <p>Browse and filter customer feedback</p>
              </div>

              <span className="reviews-count">
                {filteredReviews.length} results
              </span>
            </div>

            <div className="review-filters">

              <div className="search-bar review-search">
                <Search size={17} />

                <input
                  type="text"
                  placeholder="Search customer, service or provider..."
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(event.target.value)
                  }
                />
              </div>

              <div className="rating-filter">
                <Filter size={16} />

                <select
                  value={ratingFilter}
                  onChange={(event) =>
                    setRatingFilter(event.target.value)
                  }
                  aria-label="Filter reviews by rating"
                >
                  <option value="All">All ratings</option>
                  <option value="5">5 stars</option>
                  <option value="4">4 stars</option>
                  <option value="3">3 stars</option>
                  <option value="2">2 stars</option>
                  <option value="1">1 star</option>
                </select>
              </div>

            </div>

            <div className="all-reviews-list">

              {filteredReviews.map((review) => (

                <article
                  className="admin-review-card"
                  key={review.id}
                >

                  <div className="admin-review-top">

                    <div className="review-customer-info">
                      <div className="avatar">
                        {review.customer.charAt(0).toUpperCase()}
                      </div>

                      <div>
                        <h3>{review.customer}</h3>
                        <p>{review.date}</p>
                      </div>
                    </div>

                    <span className="review-published">
                      {review.status}
                    </span>

                  </div>

                  <div className="admin-review-details">

                    <Rating
                      value={review.rating}
                      readOnly
                      size={15}
                    />

                    <span className="review-service-tag">
                      {review.service}
                    </span>

                    <span className="review-provider">
                      Provider: {review.provider}
                    </span>

                  </div>

                  <p className="admin-review-comment">
                    {review.comment}
                  </p>

                </article>

              ))}

              {filteredReviews.length === 0 && (
                <div className="empty-state">
                  <Search size={28} />
                  <h3>No reviews found</h3>
                  <p>
                    Try changing your search term or rating filter.
                  </p>
                </div>
              )}

            </div>

          </section>
        </>
      )}
    </div>
  );
}

export default Reviews;
