import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import reviewService from "../../services/reviewService";
import {
  FiStar,
  FiThumbsUp,
  FiEdit2,
  FiTrash2,
  FiUser,
  FiClock,
  FiCheckCircle,
  FiMessageCircle,
} from "react-icons/fi";
import toast from "react-hot-toast";

const ProductReviews = ({ productId }) => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [formData, setFormData] = useState({
    rating: 5,
    title: "",
    comment: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingCounts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });

  const [editingReply, setEditingReply] = useState(null);
  const [editReplyText, setEditReplyText] = useState("");

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  useEffect(() => {
    reviews.forEach((review) => {});
  }, [user, isAdmin, reviews]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await reviewService.getProductReviews(productId);
      setReviews(Array.isArray(data) ? data : []);
      calculateStats(data);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (reviewsData) => {
    if (!reviewsData || reviewsData.length === 0) {
      setStats({
        averageRating: 0,
        totalReviews: 0,
        ratingCounts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      });
      return;
    }

    const total = reviewsData.length;
    const sum = reviewsData.reduce((acc, review) => acc + review.rating, 0);
    const average = sum / total;

    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviewsData.forEach((review) => {
      counts[review.rating] = (counts[review.rating] || 0) + 1;
    });

    setStats({
      averageRating: average,
      totalReviews: total,
      ratingCounts: counts,
    });
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRatingClick = (rating) => {
    setFormData({ ...formData, rating });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error("Please login to write a review");
      return;
    }

    if (!formData.comment.trim()) {
      toast.error("Please write a comment");
      return;
    }

    try {
      setSubmitting(true);

      if (editingReview) {
        await reviewService.updateReview(editingReview.id, {
          rating: formData.rating,
          title: formData.title,
          comment: formData.comment,
        });
        toast.success("Review updated successfully");
      } else {
        await reviewService.addReview(productId, {
          rating: formData.rating,
          title: formData.title,
          comment: formData.comment,
        });
        toast.success("Review added successfully");
      }

      setShowReviewForm(false);
      setEditingReview(null);
      setFormData({ rating: 5, title: "", comment: "" });
      fetchReviews();
    } catch (error) {
      console.error("Failed to save review:", error);
      toast.error(error.response?.data?.message || "Failed to save review");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (review) => {
    setEditingReview(review);
    setFormData({
      rating: review.rating,
      title: review.title || "",
      comment: review.comment,
    });
    setShowReviewForm(true);
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) {
      return;
    }

    try {
      await reviewService.deleteReview(reviewId);
      toast.success("Review deleted successfully");
      fetchReviews();
    } catch (error) {
      console.error("Failed to delete review:", error);
      toast.error("Failed to delete review");
    }
  };

  const handleHelpful = async (reviewId) => {
    if (!isAuthenticated) {
      toast.error("Please login to mark reviews as helpful");
      return;
    }

    try {
      const response = await reviewService.markHelpful(reviewId);

      setReviews((prevReviews) =>
        prevReviews.map((r) =>
          r.id === reviewId
            ? {
                ...r,
                helpfulCount: response.helpfulCount,
                userHelpful: response.userHelpful,
              }
            : r,
        ),
      );

      toast.success(
        response.userHelpful ? "Marked as helpful" : "Removed helpful mark",
      );
    } catch (error) {
      console.error("Failed to mark helpful:", error);
      toast.error("Failed to mark as helpful");
    }
  };

  const handleReply = async (reviewId) => {
    if (!replyText.trim()) {
      toast.error("Please enter a reply");
      return;
    }

    try {
      setSubmitting(true);
      const newReply = await reviewService.addReply(reviewId, replyText);

      setReviews((prevReviews) =>
        prevReviews.map((review) =>
          review.id === reviewId
            ? {
                ...review,
                replies: [...(review.replies || []), newReply],
              }
            : review,
        ),
      );

      setReplyingTo(null);
      setReplyText("");
      toast.success("Reply added");
    } catch (error) {
      console.error("Failed to add reply:", error);
      toast.error("Failed to add reply");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditReply = async (reviewId, reply) => {
    setEditingReply({ reviewId, reply });
    setEditReplyText(reply.text);
  };

  const handleUpdateReply = async () => {
    if (!editReplyText.trim()) {
      toast.error("Please enter a reply");
      return;
    }

    try {
      const response = await reviewService.editReply(
        editingReply.reviewId,
        editingReply.reply.id,
        editReplyText,
      );

      // Update the local state
      setReviews((prevReviews) =>
        prevReviews.map((review) =>
          review.id === editingReply.reviewId
            ? {
                ...review,
                replies: review.replies.map((r) =>
                  r.id === editingReply.reply.id
                    ? { ...r, text: editReplyText, edited: true }
                    : r,
                ),
              }
            : review,
        ),
      );

      setEditingReply(null);
      setEditReplyText("");
      toast.success("Reply updated");
    } catch (error) {
      console.error("Failed to update reply:", error);
      toast.error("Failed to update reply");
    }
  };

  const handleDeleteReply = async (reviewId, replyId) => {
    if (!window.confirm("Are you sure you want to delete this reply?")) {
      return;
    }

    try {
      await reviewService.deleteReply(reviewId, replyId);

      // Update local state
      setReviews((prevReviews) =>
        prevReviews.map((review) =>
          review.id === reviewId
            ? {
                ...review,
                replies: review.replies.filter((r) => r.id !== replyId),
              }
            : review,
        ),
      );

      toast.success("Reply deleted");
    } catch (error) {
      console.error("Failed to delete reply:", error);
      toast.error("Failed to delete reply");
    }
  };
  const canModifyReview = (review) => {
    if (!user) return false;
    return user.id === review.userId || isAdmin;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();

    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) {
      return "Just now";
    } else if (diffMins < 60) {
      return `${diffMins} minute${diffMins === 1 ? "" : "s"} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  };

  const renderStars = (rating, interactive = false) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => interactive && handleRatingClick(i)}
          className={`${interactive ? "cursor-pointer hover:scale-110" : "cursor-default"} transition-transform`}
          disabled={!interactive}
        >
          <FiStar
            className={`h-5 w-5 ${
              i <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            } ${interactive ? "hover:fill-yellow-400" : ""}`}
          />
        </button>,
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Customer Reviews</h2>
        {isAuthenticated && !showReviewForm && (
          <button
            onClick={() => setShowReviewForm(true)}
            className="btn-primary"
          >
            Write a Review
          </button>
        )}
      </div>

      {/* Rating Summary */}
      <div className="grid md:grid-cols-3 gap-6 mb-8 p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-5xl font-bold text-primary-600">
            {stats.averageRating.toFixed(1)}
          </div>
          <div className="flex justify-center my-2">
            {renderStars(Math.round(stats.averageRating))}
          </div>
          <div className="text-sm text-gray-500">
            Based on {stats.totalReviews}{" "}
            {stats.totalReviews === 1 ? "review" : "reviews"}
          </div>
        </div>
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <div className="mb-8 p-4 border-2 border-primary-200 rounded-lg bg-primary-50">
          <h3 className="font-semibold mb-4">
            {editingReview ? "Edit Your Review" : "Write a Review"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Rating *
              </label>
              <div className="flex gap-1">
                {renderStars(formData.rating, true)}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review Title (Optional)
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Summarize your experience"
                maxLength="100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Review *
              </label>
              <textarea
                name="comment"
                value={formData.comment}
                onChange={handleInputChange}
                rows="4"
                className="input-field"
                placeholder="Share your thoughts about this product..."
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary flex-1"
              >
                {submitting
                  ? "Submitting..."
                  : editingReview
                    ? "Update Review"
                    : "Submit Review"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowReviewForm(false);
                  setEditingReview(null);
                  setFormData({ rating: 5, title: "", comment: "" });
                }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div
              key={review.id}
              className="border-b last:border-0 pb-6 last:pb-0"
            >
              {/* Review Header */}
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center">
                    <FiUser className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <div className="font-medium">
                      {review.user?.name || "Anonymous"}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <div className="flex">{renderStars(review.rating)}</div>
                      <span>•</span>
                      <div className="flex items-center">
                        <FiClock className="h-3 w-3 mr-1" />
                        {formatDate(review.createdAt)}
                      </div>
                      {review.verified && (
                        <>
                          <span>•</span>
                          <div className="flex items-center text-green-600">
                            <FiCheckCircle className="h-3 w-3 mr-1" />
                            Verified Purchase
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Review Actions */}
                {canModifyReview(review) && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(review)}
                      className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                      title="Edit"
                    >
                      <FiEdit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(review.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Review Title */}
              {review.title && (
                <h4 className="font-semibold mt-2">{review.title}</h4>
              )}

              {/* Review Comment */}
              <p className="text-gray-700 mt-1">{review.comment}</p>

              {/* Helpful Button */}
              <div className="flex items-center gap-4 mt-3">
                <button
                  onClick={() => handleHelpful(review.id)}
                  className={`text-sm flex items-center gap-1 transition-colors ${
                    review.userHelpful
                      ? "text-primary-600"
                      : "text-gray-500 hover:text-primary-600"
                  }`}
                >
                  <FiThumbsUp
                    className={`h-4 w-4 ${review.userHelpful ? "fill-primary-600" : ""}`}
                  />
                  Helpful ({review.helpfulCount || 0})
                </button>

                {/* Reply Button */}
                {isAuthenticated && !replyingTo && (
                  <button
                    onClick={() => setReplyingTo(review.id)}
                    className="text-sm text-gray-500 hover:text-primary-600 flex items-center gap-1 transition-colors"
                  >
                    <FiMessageCircle className="h-4 w-4" />
                    Reply
                  </button>
                )}
              </div>

              {/* Reply Form */}
              {replyingTo === review.id && (
                <div className="mt-4 ml-8">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write your reply..."
                    className="input-field text-sm"
                    rows="2"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleReply(review.id)}
                      className="px-3 py-1 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700"
                    >
                      Post Reply
                    </button>
                    <button
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyText("");
                      }}
                      className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Replies */}
              {review.replies && review.replies.length > 0 && (
                <div className="mt-4 ml-8 pl-4 border-l-2 border-gray-200">
                  {review.replies.map((reply, idx) => (
                    <div key={idx} className="mb-3 group">
                      {editingReply?.reply.id === reply.id ? (
                        // Edit mode
                        <div className="mb-2">
                          <textarea
                            value={editReplyText}
                            onChange={(e) => setEditReplyText(e.target.value)}
                            className="input-field text-sm"
                            rows="2"
                          />
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={handleUpdateReply}
                              className="px-3 py-1 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingReply(null)}
                              className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        // View mode
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <FiMessageCircle className="h-4 w-4 text-primary-600" />
                              <span className="font-medium text-sm">
                                {reply.userName}
                              </span>
                              <span className="text-xs text-gray-500">•</span>
                              <span className="text-xs text-gray-500">
                                {formatDate(reply.date)}
                              </span>
                              {reply.edited && (
                                <span className="text-xs text-gray-400 italic">
                                  (edited)
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-700 mt-1">
                              {reply.text}
                            </p>
                          </div>

                          {/* Reply Actions */}
                          {(user?.id === reply.userId || isAdmin) && (
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() =>
                                  handleEditReply(review.id, reply)
                                }
                                className="text-gray-400 hover:text-primary-600"
                                title="Edit reply"
                              >
                                <FiEdit2 className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteReply(review.id, reply.id)
                                }
                                className="text-gray-400 hover:text-red-600"
                                title="Delete reply"
                              >
                                <FiTrash2 className="h-3 w-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">💬</div>
            <p className="text-gray-500">No reviews yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductReviews;
