package com.smartbilling.exception;

public class DuplicateBillException extends RuntimeException {
    public DuplicateBillException(String message) {
        super(message);
    }
}
