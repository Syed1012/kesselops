package de.kesselops.operations.repository;

import de.kesselops.operations.model.CustomerReview;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface CustomerReviewRepository extends JpaRepository<CustomerReview, Long> {

    List<CustomerReview> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query("select avg(r.rating) from CustomerReview r")
    Double findAverageRating();

    @Query("select avg(r.staffBehaviorRating) from CustomerReview r")
    Double findAverageStaffBehaviorRating();
}
