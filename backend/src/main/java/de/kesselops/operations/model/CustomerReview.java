package de.kesselops.operations.model;

import de.kesselops.shared.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

/**
 * Global customer review submitted via public QR review flow.
 */
@Entity
@Table(name = "customer_reviews")
public class CustomerReview extends BaseEntity {

    @Column(name = "reviewer_name", nullable = false, length = 120)
    private String reviewerName;

    @Column(name = "rating", nullable = false)
    private Integer rating;

    @Column(name = "staff_behavior_rating", nullable = false)
    private Integer staffBehaviorRating;

    @Column(name = "comment", nullable = false, length = 2000)
    private String comment;

    @Column(name = "source", nullable = false, length = 20)
    private String source = "QR";

    public String getReviewerName() {
        return reviewerName;
    }

    public void setReviewerName(String reviewerName) {
        this.reviewerName = reviewerName;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public Integer getStaffBehaviorRating() {
        return staffBehaviorRating;
    }

    public void setStaffBehaviorRating(Integer staffBehaviorRating) {
        this.staffBehaviorRating = staffBehaviorRating;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }
}
