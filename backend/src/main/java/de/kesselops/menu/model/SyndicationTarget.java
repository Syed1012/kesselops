package de.kesselops.menu.model;

/**
 * External platforms for menu syndication.
 */
public enum SyndicationTarget {
    SPEISEKARTE_DE("speisekarte.de"),
    GOOGLE_BUSINESS("Google Business Profile"),
    TRIPADVISOR("TripAdvisor"),
    UBER_EATS("Uber Eats"),
    LIEFERANDO("Lieferando"),
    WOLT("Wolt");

    private final String displayName;

    SyndicationTarget(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
