package de.kesselops.inventory.dto;

import de.kesselops.inventory.model.Supplier;

import java.time.Instant;

/**
 * Response DTO for supplier data.
 */
public class SupplierResponse {

    private Long id;
    private String name;
    private String contactPerson;
    private String email;
    private String phone;
    private String address;
    private String notes;
    private boolean active;
    private Instant createdAt;
    private Instant updatedAt;

    public static SupplierResponse fromEntity(Supplier entity) {
        SupplierResponse response = new SupplierResponse();
        response.id = entity.getId();
        response.name = entity.getName();
        response.contactPerson = entity.getContactPerson();
        response.email = entity.getEmail();
        response.phone = entity.getPhone();
        response.address = entity.getAddress();
        response.notes = entity.getNotes();
        response.active = entity.isActive();
        response.createdAt = entity.getCreatedAt();
        response.updatedAt = entity.getUpdatedAt();
        return response;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getContactPerson() {
        return contactPerson;
    }

    public void setContactPerson(String contactPerson) {
        this.contactPerson = contactPerson;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
