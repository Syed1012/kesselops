package de.kesselops.operations.service;

import de.kesselops.operations.model.Venue;
import de.kesselops.operations.model.User;
import de.kesselops.operations.repository.UserRepository;
import de.kesselops.operations.repository.VenueRepository;
import de.kesselops.shared.model.Role;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service for venue management operations.
 */
@Service
public class VenueService {

    private final VenueRepository venueRepository;
    private final UserRepository userRepository;

    public VenueService(VenueRepository venueRepository, UserRepository userRepository) {
        this.venueRepository = venueRepository;
        this.userRepository = userRepository;
    }

    /**
     * Create a new venue.
     */
    @Transactional
    public Venue createVenue(CreateVenueRequest request, User owner) {
        Venue venue = new Venue();
        venue.setName(request.name());
        venue.setAddress(request.address());
        venue.setCity(request.city());
        venue.setType(request.type());
        venue.setTimezone(request.timezone() != null ? request.timezone() : "Europe/Berlin");
        venue.setOwnerId(owner.getId());

        Venue saved = venueRepository.save(venue);

        // Also set the owner's venueId so it propagates to invited team members
        if (owner.getVenueId() == null) {
            owner.setVenueId(saved.getId());
            userRepository.save(owner);
        }

        return saved;
    }

    /**
     * List venues accessible to the user.
     */
    public List<Venue> listVenues(User user) {
        if (user.getRole() == Role.OWNER) {
            return venueRepository.findByOwnerId(user.getId());
        } else {
            // Non-owners see their assigned venue
            if (user.getVenueId() != null) {
                return venueRepository.findById(user.getVenueId())
                        .map(List::of)
                        .orElse(List.of());
            }
            return List.of();
        }
    }

    /**
     * Get a venue by ID.
     */
    public Venue getVenue(Long id, User currentUser) {
        if (currentUser.getRole() == Role.OWNER) {
            return venueRepository.findByIdAndOwnerId(id, currentUser.getId())
                    .orElseThrow(() -> new IllegalArgumentException("Venue not found"));
        }

        if (currentUser.getVenueId() != null && currentUser.getVenueId().equals(id)) {
            return venueRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Venue not found"));
        }

        throw new IllegalArgumentException("Access denied to venue");
    }

    /**
     * Update venue details.
     */
    @Transactional
    public Venue updateVenue(Long id, CreateVenueRequest request, User currentUser) {
        if (currentUser.getRole() != Role.OWNER) {
            throw new IllegalArgumentException("Only Owners can update venues");
        }

        Venue venue = venueRepository.findByIdAndOwnerId(id, currentUser.getId())
                .orElseThrow(() -> new IllegalArgumentException("Venue not found"));

        venue.setName(request.name());
        venue.setAddress(request.address());
        venue.setCity(request.city());
        venue.setType(request.type());
        if (request.timezone() != null) {
            venue.setTimezone(request.timezone());
        }
        return venueRepository.save(venue);
    }

    // DTO for create/update request
    public record CreateVenueRequest(
            String name,
            String address,
            String city,
            String type,
            String timezone
    ) {}
}
