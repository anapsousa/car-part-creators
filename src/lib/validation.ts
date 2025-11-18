import { parsePhoneNumber, isValidPhoneNumber, CountryCode } from 'libphonenumber-js';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// Postal code patterns by country
const postalCodePatterns: Record<string, { pattern: RegExp; example: string }> = {
  US: { pattern: /^\d{5}(-\d{4})?$/, example: '12345 or 12345-6789' },
  GB: { pattern: /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i, example: 'SW1A 1AA' },
  CA: { pattern: /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i, example: 'K1A 0B1' },
  DE: { pattern: /^\d{5}$/, example: '12345' },
  FR: { pattern: /^\d{5}$/, example: '75001' },
  IT: { pattern: /^\d{5}$/, example: '00100' },
  ES: { pattern: /^\d{5}$/, example: '28001' },
  PT: { pattern: /^\d{4}-\d{3}$/, example: '1000-001' },
  NL: { pattern: /^\d{4}\s?[A-Z]{2}$/i, example: '1012 AB' },
  BE: { pattern: /^\d{4}$/, example: '1000' },
  AU: { pattern: /^\d{4}$/, example: '2000' },
  NZ: { pattern: /^\d{4}$/, example: '1010' },
  JP: { pattern: /^\d{3}-\d{4}$/, example: '100-0001' },
  CN: { pattern: /^\d{6}$/, example: '100000' },
  IN: { pattern: /^\d{6}$/, example: '110001' },
  BR: { pattern: /^\d{5}-\d{3}$/, example: '01310-100' },
  MX: { pattern: /^\d{5}$/, example: '01000' },
  // Add more countries as needed
};

export const validatePostalCode = (postalCode: string, country: string): ValidationResult => {
  if (!postalCode || !postalCode.trim()) {
    return { isValid: false, error: 'Postal code is required' };
  }

  const countryUpper = country.toUpperCase();
  const pattern = postalCodePatterns[countryUpper];

  if (!pattern) {
    // For countries without specific pattern, just check it's not empty
    return { isValid: true };
  }

  if (!pattern.pattern.test(postalCode.trim())) {
    return {
      isValid: false,
      error: `Invalid postal code format for ${countryUpper}. Example: ${pattern.example}`,
    };
  }

  return { isValid: true };
};

export const validatePhone = (phone: string, country?: string): ValidationResult => {
  if (!phone || !phone.trim()) {
    return { isValid: false, error: 'Phone number is required' };
  }

  try {
    const countryCode = country?.toUpperCase() as CountryCode | undefined;
    
    // Try parsing with country code if provided
    if (countryCode && isValidPhoneNumber(phone, countryCode)) {
      return { isValid: true };
    }

    // Try parsing without country code (international format)
    if (isValidPhoneNumber(phone)) {
      return { isValid: true };
    }

    // Try parsing the number to get more details
    const phoneNumber = parsePhoneNumber(phone, countryCode);
    if (phoneNumber && phoneNumber.isValid()) {
      return { isValid: true };
    }

    return {
      isValid: false,
      error: 'Invalid phone number. Please use international format (e.g., +1234567890) or include country code',
    };
  } catch (error) {
    return {
      isValid: false,
      error: 'Invalid phone number format',
    };
  }
};

export const formatPhoneNumber = (phone: string, country?: string): string => {
  try {
    const countryCode = country?.toUpperCase() as CountryCode | undefined;
    const phoneNumber = parsePhoneNumber(phone, countryCode);
    return phoneNumber ? phoneNumber.formatInternational() : phone;
  } catch {
    return phone;
  }
};

export const validateAddress = (address: string): ValidationResult => {
  if (!address || !address.trim()) {
    return { isValid: false, error: 'Street address is required' };
  }
  if (address.trim().length < 5) {
    return { isValid: false, error: 'Please enter a complete street address' };
  }
  return { isValid: true };
};

export const validateCity = (city: string): ValidationResult => {
  if (!city || !city.trim()) {
    return { isValid: false, error: 'City is required' };
  }
  if (city.trim().length < 2) {
    return { isValid: false, error: 'Please enter a valid city name' };
  }
  // City should contain only letters, spaces, hyphens, and apostrophes
  if (!/^[a-zA-ZÀ-ÿ\s'-]{2,}$/.test(city.trim())) {
    return { isValid: false, error: 'City name should only contain letters, spaces, and hyphens' };
  }
  return { isValid: true };
};

export const validateCountry = (country: string): ValidationResult => {
  if (!country || !country.trim()) {
    return { isValid: false, error: 'Country is required' };
  }
  if (country.trim().length < 2) {
    return { isValid: false, error: 'Please enter a valid country' };
  }
  return { isValid: true };
};

export const validateShippingAddress = (
  address: string,
  city: string,
  postalCode: string,
  country: string,
  phone: string
): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  const addressValidation = validateAddress(address);
  if (!addressValidation.isValid) errors.address = addressValidation.error!;

  const cityValidation = validateCity(city);
  if (!cityValidation.isValid) errors.city = cityValidation.error!;

  const postalValidation = validatePostalCode(postalCode, country);
  if (!postalValidation.isValid) errors.postal_code = postalValidation.error!;

  const countryValidation = validateCountry(country);
  if (!countryValidation.isValid) errors.country = countryValidation.error!;

  const phoneValidation = validatePhone(phone, country);
  if (!phoneValidation.isValid) errors.phone = phoneValidation.error!;

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
