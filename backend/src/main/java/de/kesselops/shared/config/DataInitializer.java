package de.kesselops.shared.config;

import de.kesselops.guest.model.Reservation;
import de.kesselops.guest.model.Session;
import de.kesselops.guest.model.TableEntity;
import de.kesselops.guest.repository.ReservationRepository;
import de.kesselops.guest.repository.SessionRepository;
import de.kesselops.guest.repository.TableRepository;
import de.kesselops.inventory.model.*;
import de.kesselops.inventory.repository.InventoryItemRepository;
import de.kesselops.inventory.repository.MenuItemRepository;
import de.kesselops.inventory.repository.RecipeRepository;
import de.kesselops.operations.model.Venue;
import de.kesselops.operations.model.User;
import de.kesselops.operations.repository.VenueRepository;
import de.kesselops.operations.repository.UserRepository;
import de.kesselops.shared.model.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.List;

@Configuration
@RequiredArgsConstructor
public class DataInitializer {

    private final MenuItemRepository menuItemRepository;
    private final InventoryItemRepository inventoryItemRepository;
    private final RecipeRepository recipeRepository;
    private final VenueRepository venueRepository;
    private final TableRepository tableRepository;
    private final SessionRepository sessionRepository;
    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner initData() {
        return args -> {
            initializeInventory();
        };
    }

    @Transactional
    public void initializeInventory() {
        // 0. Ensure User Exists for Venue Owner
        User owner = userRepository.findByEmail("admin@kesselops.de").orElse(null);
        if (owner == null) {
            owner = new User();
            owner.setFirstName("Admin");
            owner.setLastName("User");
            owner.setEmail("admin@kesselops.de");
            owner.setPassword(passwordEncoder.encode("password"));
            owner.setRole(Role.OWNER);
            owner.setIsActive(true);
            owner = userRepository.save(owner);
        }
        Long ownerId = owner.getId();

        // 0.1 Ensure Venue Exists
        Long venueId;
        List<Venue> venues = venueRepository.findAll();
        if (venues.isEmpty()) {
            Venue venue = new Venue();
            venue.setName("Midnight Lounge");
            venue.setAddress("Königstraße 12");
            venue.setCity("Stuttgart");
            venue.setType("Bar");
            venue.setTimezone("Europe/Berlin");
            venue.setOwnerId(ownerId);
            venue = venueRepository.save(venue);
            venueId = venue.getId();

            owner.setVenueId(venueId);
            userRepository.save(owner);
        } else {
            venueId = venues.get(0).getId();
        }

        System.out.println("Using Active Venue ID: " + venueId);

        // 1. Core Ingredients (Bulk Items)
        InventoryItem sodaWater = createOrUpdateInventoryItem(venueId, "Soda Water", "BEV-001", "Bottled soda water",
                "Bottle", new BigDecimal("5.00"), new BigDecimal("10.00"));
        InventoryItem gin = createOrUpdateInventoryItem(venueId, "Gin", "ALC-001", "Premium Dry Gin", "Bottle",
                new BigDecimal("20.00"), new BigDecimal("5.00"));
        InventoryItem lemon = createOrUpdateInventoryItem(venueId, "Lemon", "FRUIT-001", "Fresh Lemons", "Piece",
                new BigDecimal("10.00"), new BigDecimal("20.00"));
        InventoryItem steak = createOrUpdateInventoryItem(venueId, "Ribeye Steak", "MEAT-001",
                "300g Argentinian Ribeye", "Piece", new BigDecimal("50.00"), new BigDecimal("10.00"));
        InventoryItem brioche = createOrUpdateInventoryItem(venueId, "Brioche Buns", "BAKE-001", "Brioche slider buns",
                "Bag", new BigDecimal("5.00"), new BigDecimal("10.00"));
        InventoryItem fries = createOrUpdateInventoryItem(venueId, "Fries", "VEG-001", "Hand-cut potato fries", "KG",
                new BigDecimal("100.00"), new BigDecimal("20.00"));
        InventoryItem coffeeBeans = createOrUpdateInventoryItem(venueId, "Coffee Beans", "HOT-001",
                "Roasted espresso beans", "KG", new BigDecimal("10.00"), new BigDecimal("2.00"));

        // 2. Synchronize linkage for Table Entities and active Sessions
        List<TableEntity> allTables = tableRepository.findAll();
        for (TableEntity table : allTables) {
            if (!venueId.equals(table.getVenueId())) {
                table.setVenueId(venueId);
                tableRepository.save(table);
            }
        }

        List<Session> allSessions = sessionRepository.findAll();
        for (Session session : allSessions) {
            if (!venueId.equals(session.getVenueId())) {
                session.setVenueId(venueId);
                sessionRepository.save(session);
            }
        }

        List<Reservation> allReservations = reservationRepository.findAll();
        for (Reservation reservation : allReservations) {
            if (!venueId.equals(reservation.getVenueId())) {
                reservation.setVenueId(venueId);
                reservationRepository.save(reservation);
            }
        }

        long activeCount = allSessions.stream()
                .filter(s -> de.kesselops.guest.model.SessionStatus.ACTIVE.equals(s.getStatus())).count();
        System.out.println("Sync Summary: " + allTables.size() + " tables, " + allSessions.size() + " sessions ("
                + activeCount + " active), and "
                + allReservations.size() + " reservations linked to Venue ID " + venueId);

        // 3. Automate Recipe Seeding for all Menu Items
        // Also ensure all items point to the correct venue
        List<MenuItem> allMenuItems = menuItemRepository.findAll();
        System.out.println("Found " + allMenuItems.size() + " total menu items in database.");

        for (MenuItem item : allMenuItems) {
            // Fix venue linkage if needed (important if V7 seeded with ID 1 but our venue
            // is different)
            if (!venueId.equals(item.getVenueId())) {
                item.setVenueId(venueId);
                menuItemRepository.save(item);
            }

            if (recipeRepository.existsByMenuItemId(item.getId()))
                continue;

            Recipe recipe = new Recipe();
            recipe.setMenuItem(item);
            recipe.setInstructions("Standard preparation for " + item.getName());
            recipe.setPrepTimeMinutes(10);
            recipe.setDifficulty(DifficultyLevel.MEDIUM);
            recipe = recipeRepository.save(recipe);

            // Generic ingredient mapping based on item name keywords
            String name = item.getName().toLowerCase();
            if (name.contains("spritz") || name.contains("fashion") || name.contains("highball")
                    || name.contains("martini")) {
                addIngredientRequest(recipe, gin, new BigDecimal("0.05"), "Bottle"); // 50ml
                addIngredientRequest(recipe, sodaWater, new BigDecimal("0.2"), "Bottle");
                addIngredientRequest(recipe, lemon, new BigDecimal("0.2"), "Piece");
            } else if (name.contains("steak") || name.contains("ribeye")) {
                addIngredientRequest(recipe, steak, new BigDecimal("1.0"), "Piece");
            } else if (name.contains("sliders") || name.contains("burger")) {
                addIngredientRequest(recipe, brioche, new BigDecimal("1.0"), "Piece");
            } else if (name.contains("fries")) {
                addIngredientRequest(recipe, fries, new BigDecimal("0.3"), "KG");
            } else if (name.contains("espresso") || name.contains("coffee")) {
                addIngredientRequest(recipe, coffeeBeans, new BigDecimal("0.02"), "KG"); // 20g
            }

            recipeRepository.save(recipe);
            System.out.println("Seeded Recipe for: " + item.getName());
        }
    }

    private InventoryItem createOrUpdateInventoryItem(Long venueId, String name, String sku, String desc, String unit,
            BigDecimal quantity, BigDecimal reorderLevel) {
        Optional<InventoryItem> existing = inventoryItemRepository.findByVenueIdAndSku(venueId, sku);
        if (existing.isPresent()) {
            InventoryItem item = existing.get();
            if (item.getQuantityOnHand().compareTo(quantity) != 0
                    || item.getReorderLevel().compareTo(reorderLevel) != 0) {
                item.setQuantityOnHand(quantity);
                item.setReorderLevel(reorderLevel);
                return inventoryItemRepository.save(item);
            }
            return item;
        }
        InventoryItem item = new InventoryItem();
        item.setVenueId(venueId);
        item.setName(name);
        item.setSku(sku);
        item.setDescription(desc);
        item.setUnit(unit);
        item.setQuantityOnHand(quantity);
        item.setReorderLevel(reorderLevel);
        item.setReorderQuantity(new BigDecimal("20.00"));
        item.setUnitCost(new BigDecimal("1.50"));
        item.setActive(true);
        return inventoryItemRepository.save(item);
    }

    private void addIngredientRequest(Recipe recipe, InventoryItem item, BigDecimal qty, String unit) {
        RecipeIngredient ingredient = new RecipeIngredient();
        ingredient.setRecipe(recipe);
        ingredient.setInventoryItem(item);
        ingredient.setQuantity(qty);
        ingredient.setUnit(unit);
        recipe.addIngredient(ingredient);
    }
}
