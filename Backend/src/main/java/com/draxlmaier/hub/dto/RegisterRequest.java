package com.draxlmaier.hub.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record RegisterRequest(
    String email,
    String name,
    String password,
    String department
) {}
