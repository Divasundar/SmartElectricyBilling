package com.smartbilling.exception;

public class MissingTariffException extends RuntimeException {
    public MissingTariffException(String message) {
        super(message);
    }
}
