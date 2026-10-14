package com.smartbilling.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI smartBillingOpenAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("Smart Electricity Billing System API")
                .description("Production-grade RESTful API for Smart Electricity Billing Engine (Cycle 4)")
                .version("1.0.0")
                .contact(new Contact()
                    .name("Smart Billing Engineering")
                    .email("support@smartbilling.com"))
                .license(new License().name("Apache 2.0")));
    }
}
