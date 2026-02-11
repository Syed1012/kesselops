package de.kesselops.ai.dto;

import de.kesselops.inventory.dto.MenuItemResponse;

import java.util.List;

/**
 * Response DTO for AI menu recommendations.
 */
public class RecommendationResponse {

    private List<Recommendation> recommendations;
    private String reasoning;

    public RecommendationResponse() {
    }

    public RecommendationResponse(List<Recommendation> recommendations, String reasoning) {
        this.recommendations = recommendations;
        this.reasoning = reasoning;
    }

    public List<Recommendation> getRecommendations() {
        return recommendations;
    }

    public void setRecommendations(List<Recommendation> recommendations) {
        this.recommendations = recommendations;
    }

    public String getReasoning() {
        return reasoning;
    }

    public void setReasoning(String reasoning) {
        this.reasoning = reasoning;
    }

    public static class Recommendation {
        private MenuItemResponse item;
        private String reason;

        public Recommendation() {
        }

        public Recommendation(MenuItemResponse item, String reason) {
            this.item = item;
            this.reason = reason;
        }

        public MenuItemResponse getItem() {
            return item;
        }

        public void setItem(MenuItemResponse item) {
            this.item = item;
        }

        public String getReason() {
            return reason;
        }

        public void setReason(String reason) {
            this.reason = reason;
        }
    }
}
