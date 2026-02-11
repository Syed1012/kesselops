package de.kesselops.operations.controller;

import de.kesselops.operations.model.CustomerReview;
import de.kesselops.operations.service.CustomerReviewService;
import de.kesselops.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class CustomerReviewController {

    private final CustomerReviewService customerReviewService;

    public CustomerReviewController(CustomerReviewService customerReviewService) {
        this.customerReviewService = customerReviewService;
    }

    @PostMapping("/public")
    public ResponseEntity<ApiResponse<ReviewResponse>> submitPublicReview(
            @Valid @RequestBody SubmitReviewRequest request
    ) {
        try {
            CustomerReview saved = customerReviewService.submitPublicReview(
                    request.reviewerName(),
                    request.rating(),
                    request.staffBehaviorRating(),
                    request.comment()
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(toResponse(saved)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("INVALID_REQUEST", e.getMessage()));
        }
    }

    @GetMapping("/recent")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'CHEF')")
    public ResponseEntity<ApiResponse<ReviewFeedResponse>> getRecentReviews(
            @RequestParam(defaultValue = "4") Integer limit
    ) {
        CustomerReviewService.ReviewFeed feed = customerReviewService.getReviewFeed(limit);
        List<ReviewResponse> reviews = feed.reviews().stream().map(this::toResponse).toList();

        ReviewFeedResponse response = new ReviewFeedResponse(
                feed.averageRating(),
                feed.averageStaffBehaviorRating(),
                feed.totalReviews(),
                reviews
        );

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    private ReviewResponse toResponse(CustomerReview review) {
        return new ReviewResponse(
                review.getId(),
                review.getReviewerName(),
                review.getRating(),
                review.getStaffBehaviorRating(),
                review.getComment(),
                review.getSource(),
                review.getCreatedAt().toString()
        );
    }

    public record SubmitReviewRequest(
            @Size(max = 120) String reviewerName,
            @NotNull @Min(1) @Max(5) Integer rating,
            @NotNull @Min(1) @Max(5) Integer staffBehaviorRating,
            @NotBlank @Size(max = 2000) String comment
    ) {}

    public record ReviewResponse(
            Long id,
            String reviewerName,
            Integer rating,
            Integer staffBehaviorRating,
            String comment,
            String source,
            String createdAt
    ) {}

    public record ReviewFeedResponse(
            Double averageRating,
            Double averageStaffBehaviorRating,
            Long totalReviews,
            List<ReviewResponse> reviews
    ) {}
}
