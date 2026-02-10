package de.kesselops.shared.exception;

/**
 * Exception thrown when a business rule is violated.
 */
public class BusinessRuleException extends RuntimeException {

    private final String code;
    private final String field;

    public BusinessRuleException(String code, String message) {
        super(message);
        this.code = code;
        this.field = null;
    }

    public BusinessRuleException(String code, String message, String field) {
        super(message);
        this.code = code;
        this.field = field;
    }

    public String getCode() {
        return code;
    }

    public String getField() {
        return field;
    }
}
