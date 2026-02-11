package de.kesselops.operations.service;

import de.kesselops.operations.model.CustomerReview;
import de.kesselops.operations.repository.CustomerReviewRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CustomerReviewService {

    private static final int DEFAULT_LIMIT = 4;
    private static final int MAX_LIMIT = 20;

    private final CustomerReviewRepository customerReviewRepository;

    public CustomerReviewService(CustomerReviewRepository customerReviewRepository) {
        this.customerReviewRepository = customerReviewRepository;
    }

    @Transactional
    public CustomerReview submitPublicReview(
            String reviewerName,
            Integer rating,
            Integer staffBehaviorRating,
            String comment
    ) {
        if (rating == null || rating < 1 || rating > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }
        if (staffBehaviorRating == null || staffBehaviorRating < 1 || staffBehaviorRating > 5) {
            throw new IllegalArgumentException("Staff behavior rating must be between 1 and 5");
        }

        String normalizedComment = comment == null ? "" : comment.trim();
        if (normalizedComment.isEmpty()) {
            throw new IllegalArgumentException("Description is required");
        }
        if (normalizedComment.length() > 2000) {
            throw new IllegalArgumentException("Description is too long");
        }

        String normalizedReviewerName = reviewerName == null ? "" : reviewerName.trim();
        if (normalizedReviewerName.isEmpty()) {
            normalizedReviewerName = "Guest";
        } else if (normalizedReviewerName.length() > 120) {
            normalizedReviewerName = normalizedReviewerName.substring(0, 120);
        }

        CustomerReview review = new CustomerReview();
        review.setReviewerName(normalizedReviewerName);
        review.setRating(rating);
        review.setStaffBehaviorRating(staffBehaviorRating);
        review.setComment(normalizedComment);
        review.setSource("QR");

        return customerReviewRepository.save(review);
    }

    public ReviewFeed getReviewFeed(Integer requestedLimit) {
        int limit = sanitizeLimit(requestedLimit);
        List<CustomerReview> reviews = customerReviewRepository.findAllByOrderByCreatedAtDesc(
                PageRequest.of(0, limit)
        );

        double averageRating = roundToOneDecimal(orZero(customerReviewRepository.findAverageRating()));
        double averageStaffBehaviorRating = roundToOneDecimal(
                orZero(customerReviewRepository.findAverageStaffBehaviorRating())
        );
        long totalReviews = customerReviewRepository.count();

        return new ReviewFeed(averageRating, averageStaffBehaviorRating, totalReviews, reviews);
    }

    private int sanitizeLimit(Integer requestedLimit) {
        if (requestedLimit == null) {
            return DEFAULT_LIMIT;
        }
        return Math.max(1, Math.min(MAX_LIMIT, requestedLimit));
    }

    private double orZero(Double value) {
        return value == null ? 0.0 : value;
    }

    private double roundToOneDecimal(double value) {
        return Math.round(value * 10.0) / 10.0;
    }

    public record ReviewFeed(
            double averageRating,
            double averageStaffBehaviorRating,
            long totalReviews,
            List<CustomerReview> reviews
    ) {}
}
