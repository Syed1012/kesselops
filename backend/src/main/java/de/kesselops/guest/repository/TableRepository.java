package de.kesselops.guest.repository;

import de.kesselops.guest.model.TableEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TableRepository extends JpaRepository<TableEntity, Long> {

    List<TableEntity> findByVenueId(Long venueId);

    List<TableEntity> findByVenueIdAndIsActiveTrue(Long venueId);
}
