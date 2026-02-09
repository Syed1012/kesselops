package de.kesselops.operations.service;

import de.kesselops.operations.model.Shift;
import de.kesselops.operations.model.ShiftType;
import de.kesselops.operations.repository.ShiftRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

/**
 * Service for shift management operations.
 */
@Service
public class ShiftService {

    private final ShiftRepository shiftRepository;

    public ShiftService(ShiftRepository shiftRepository) {
        this.shiftRepository = shiftRepository;
    }

    /**
     * Create a new shift.
     */
    @Transactional
    public Shift createShift(CreateShiftRequest request) {
        Shift shift = new Shift();
        shift.setVenueId(request.venueId());
        shift.setUserId(request.userId());
        shift.setStartTime(request.startTime());
        shift.setEndTime(request.endTime());
        shift.setType(request.type());
        shift.setNotes(request.notes());
        shift.setIsActive(false);

        return shiftRepository.save(shift);
    }

    /**
     * List shifts with pagination and filtering.
     */
    public Page<Shift> listShifts(Long venueId, Instant from, Instant to, Pageable pageable) {
        if (from != null && to != null) {
            return shiftRepository.findByVenueIdAndDateRange(venueId, from, to, pageable);
        }
        return shiftRepository.findByVenueId(venueId, pageable);
    }

    /**
     * Get a shift by ID.
     */
    public Shift getShift(Long id) {
        return shiftRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Shift not found"));
    }

    /**
     * Update shift details.
     */
    @Transactional
    public Shift updateShift(Long id, UpdateShiftRequest request) {
        Shift shift = getShift(id);
        
        if (request.startTime() != null) shift.setStartTime(request.startTime());
        if (request.endTime() != null) shift.setEndTime(request.endTime());
        if (request.type() != null) shift.setType(request.type());
        if (request.notes() != null) shift.setNotes(request.notes());

        return shiftRepository.save(shift);
    }

    /**
     * Start a shift.
     */
    @Transactional
    public Shift startShift(Long id) {
        Shift shift = getShift(id);
        shift.setIsActive(true);
        return shiftRepository.save(shift);
    }

    /**
     * End a shift.
     */
    @Transactional
    public Shift endShift(Long id) {
        Shift shift = getShift(id);
        shift.setIsActive(false);
        return shiftRepository.save(shift);
    }

    /**
     * Delete a shift.
     */
    @Transactional
    public void deleteShift(Long id) {
        Shift shift = getShift(id);
        shiftRepository.delete(shift);
    }

    /**
     * Get active shift for a venue.
     */
    public Shift getActiveShift(Long venueId) {
        return shiftRepository.findByVenueIdAndIsActiveTrue(venueId)
                .orElse(null);
    }

    // DTOs
    public record CreateShiftRequest(
            Long venueId,
            Long userId,
            Instant startTime,
            Instant endTime,
            ShiftType type,
            String notes
    ) {}

    public record UpdateShiftRequest(
            Instant startTime,
            Instant endTime,
            ShiftType type,
            String notes
    ) {}
}
