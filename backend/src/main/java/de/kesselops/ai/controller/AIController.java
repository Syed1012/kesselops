package de.kesselops.ai.controller;

import de.kesselops.ai.dto.ChatRequest;
import de.kesselops.ai.dto.ChatResponse;
import de.kesselops.ai.dto.RecommendationResponse;
import de.kesselops.ai.service.MenuAIService;
import de.kesselops.shared.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for AI-powered menu features.
 */
@RestController
@RequestMapping("/api/ai")
public class AIController {

    private final MenuAIService menuAIService;

    public AIController(MenuAIService menuAIService) {
        this.menuAIService = menuAIService;
    }

    /**
     * Chat with the AI menu assistant.
     * POST /api/ai/chat
     */
    @PostMapping("/chat")
    public ResponseEntity<ApiResponse<ChatResponse>> chat(@RequestBody ChatRequest request) {
        ChatResponse response = menuAIService.chat(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Get AI-powered menu recommendations.
     * POST /api/ai/recommendations
     */
    @PostMapping("/recommendations")
    public ResponseEntity<ApiResponse<RecommendationResponse>> getRecommendations(
            @RequestParam(defaultValue = "1") Long venueId,
            @RequestBody(required = false) RecommendationRequest request) {

        List<String> cartItems = request != null ? request.getCartItemNames() : null;
        String preferences = request != null ? request.getPreferences() : null;

        RecommendationResponse response = menuAIService.getRecommendations(venueId, cartItems, preferences);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Request body for recommendations endpoint.
     */
    public static class RecommendationRequest {
        private List<String> cartItemNames;
        private String preferences;

        public List<String> getCartItemNames() {
            return cartItemNames;
        }

        public void setCartItemNames(List<String> cartItemNames) {
            this.cartItemNames = cartItemNames;
        }

        public String getPreferences() {
            return preferences;
        }

        public void setPreferences(String preferences) {
            this.preferences = preferences;
        }
    }
}
