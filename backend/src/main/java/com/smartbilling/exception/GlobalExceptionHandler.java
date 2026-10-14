package com.smartbilling.exception;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private Map<String, Object> buildErrorResponse(HttpStatus status, String error, String message) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", status.value());
        body.put("error", error);
        body.put("message", message);
        return body;
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleResourceNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(buildErrorResponse(HttpStatus.NOT_FOUND, "NOT_FOUND", ex.getMessage()));
    }

    @ExceptionHandler(DuplicateBillException.class)
    public ResponseEntity<Map<String, Object>> handleDuplicateBill(DuplicateBillException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
            .body(buildErrorResponse(HttpStatus.CONFLICT, "DUPLICATE_BILL", ex.getMessage()));
    }

    @ExceptionHandler(InvalidReadingException.class)
    public ResponseEntity<Map<String, Object>> handleInvalidReading(InvalidReadingException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(buildErrorResponse(HttpStatus.BAD_REQUEST, "INVALID_READING", ex.getMessage()));
    }

    @ExceptionHandler(MissingTariffException.class)
    public ResponseEntity<Map<String, Object>> handleMissingTariff(MissingTariffException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(buildErrorResponse(HttpStatus.BAD_REQUEST, "MISSING_TARIFF", ex.getMessage()));
    }

    @ExceptionHandler(BillAlreadyPaidException.class)
    public ResponseEntity<Map<String, Object>> handleBillAlreadyPaid(BillAlreadyPaidException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(buildErrorResponse(HttpStatus.BAD_REQUEST, "BILL_ALREADY_PAID", ex.getMessage()));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> handleDataIntegrity(DataIntegrityViolationException ex) {
        String msg = ex.getMessage() != null && ex.getMessage().toLowerCase().contains("uk_consumer_billing_period")
            ? "Bill already exists for this consumer and billing period."
            : "Database constraint violation occurred.";
        return ResponseEntity.status(HttpStatus.CONFLICT)
            .body(buildErrorResponse(HttpStatus.CONFLICT, "DUPLICATE_CONSTRAINT", msg));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationErrors(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
            .map(FieldError::getDefaultMessage)
            .collect(Collectors.joining("; "));
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(buildErrorResponse(HttpStatus.BAD_REQUEST, "VALIDATION_FAILED", message));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneralException(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR",
                ex.getMessage() != null ? ex.getMessage() : "An unexpected server error occurred."));
    }
}
