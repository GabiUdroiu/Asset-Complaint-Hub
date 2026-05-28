package com.draxlmaier.hub.model;

/**
 * Enum for user roles in the system.
 * Centralizes role definitions to avoid magic strings throughout codebase.
 */
public enum RoleEnum {
	USER("USER", "Regular employee user"),
	DEPT_RESPONSIBLE("DEPT_RESPONSIBLE", "Department responsible / manager"),
	ADMIN("ADMIN", "System administrator");

	private final String value;
	private final String description;

	RoleEnum(String value, String description) {
		this.value = value;
		this.description = description;
	}

	/**
	 * Get the string value of the role
	 */
	public String getValue() {
		return value;
	}

	/**
	 * Get the description of the role
	 */
	public String getDescription() {
		return description;
	}

	/**
	 * Convert string value to enum
	 */
	public static RoleEnum fromString(String value) {
		if (value == null || value.isBlank()) {
			throw new IllegalArgumentException("Role value cannot be null or blank");
		}

		for (RoleEnum role : RoleEnum.values()) {
			if (role.value.equalsIgnoreCase(value)) {
			return role;
			}
		}

		throw new IllegalArgumentException("Unknown role: " + value);
		}

		/**
		 * Check if two role values are equivalent
		 */
		public static boolean isEqual(String roleValue, RoleEnum role) {
		return role.value.equalsIgnoreCase(roleValue);
	}

	@Override
	public String toString() {
		return value;
	}
}
