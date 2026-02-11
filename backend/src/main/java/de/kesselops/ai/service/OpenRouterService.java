package de.kesselops.ai.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * HTTP client for OpenRouter AI API.
 * Based on OpenAI-compatible chat completions endpoint.
 */
@Service
public class OpenRouterService {

    private static final Logger log = LoggerFactory.getLogger(OpenRouterService.class);
    private static final String OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

    @Value("${kesselops.ai.openrouter.api-key}")
    private String apiKey;

    @Value("${kesselops.ai.openrouter.models:google/gemini-2.5-flash,openai/gpt-oss-120b:free}")
    private String models;

    @Value("${kesselops.ai.openrouter.referer:https://kesselops.de}")
    private String referer;

    @Value("${kesselops.ai.openrouter.app-name:KesselOps}")
    private String appName;

    private final RestTemplate restTemplate;

    public OpenRouterService() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * Send a chat completion request to OpenRouter.
     *
     * @param systemPrompt The system instruction
     * @param messages     List of conversation messages (role + content)
     * @return The AI's response text
     */
    public OpenRouterResult chatCompletion(String systemPrompt, List<Map<String, String>> messages) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + apiKey);
        headers.set("HTTP-Referer", referer);
        headers.set("X-Title", appName);

        // Build request body
        Map<String, Object> body = new HashMap<>();

        // Parse models from config
        String[] modelArray = models.split(",");
        List<String> modelList = new ArrayList<>();
        for (String m : modelArray) {
            modelList.add(m.trim());
        }
        body.put("models", modelList);

        // Build messages array with system prompt first
        List<Map<String, String>> allMessages = new ArrayList<>();
        Map<String, String> systemMessage = new HashMap<>();
        systemMessage.put("role", "system");
        systemMessage.put("content", systemPrompt);
        allMessages.add(systemMessage);
        allMessages.addAll(messages);
        body.put("messages", allMessages);

        // Optional: control response length
        body.put("max_tokens", 1000);
        body.put("temperature", 0.7);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    OPENROUTER_URL, HttpMethod.POST, entity, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> responseBody = response.getBody();

                // Extract model used
                String modelUsed = (String) responseBody.getOrDefault("model", "unknown");

                // Extract reply from choices[0].message.content
                List<Map<String, Object>> choices = (List<Map<String, Object>>) responseBody.get("choices");
                if (choices != null && !choices.isEmpty()) {
                    Map<String, Object> firstChoice = choices.get(0);
                    Map<String, Object> message = (Map<String, Object>) firstChoice.get("message");
                    if (message != null) {
                        String content = (String) message.get("content");
                        return new OpenRouterResult(content, modelUsed);
                    }
                }
            }

            log.error("Unexpected OpenRouter response: {}", response.getBody());
            return new OpenRouterResult("I'm sorry, I couldn't process your request right now.", "error");

        } catch (Exception e) {
            log.error("OpenRouter API call failed", e);
            return new OpenRouterResult("I'm having trouble connecting. Please try again in a moment.", "error");
        }
    }

    /**
     * Result wrapper for OpenRouter responses.
     */
    public record OpenRouterResult(String content, String model) {
    }
}
