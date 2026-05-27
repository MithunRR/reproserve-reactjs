/**
 * LocalStorage utility for persisting data across page refreshes
 * This is a temporary solution until backend is implemented
 */

const STORAGE_KEYS = {
  CURRENT_USER: 'reproserve_current_user',
  QUOTE_REQUESTS: 'reproserve_quote_requests',
  OPEN_HOUSES: 'reproserve_open_houses',
  PROVIDER_BIDS: 'reproserve_provider_bids',
  PROJECT_GALLERY: 'reproserve_project_gallery',
  PROFILE_DATA: 'reproserve_profile_data',
  NOTIFICATION_SETTINGS: 'reproserve_notification_settings',
  SHOW_MY_PROPERTY_REQUESTS: 'reproserve_show_my_property_requests',
  RECENT_LEADS: 'reproserve_recent_leads',
  USER_PROJECTS: 'reproserve_user_projects',
  FAVORITE_PROVIDERS: 'reproserve_favorite_providers',
  SAVED_QUOTES: 'reproserve_saved_quotes',
  PROFILE_IMAGES: 'reproserve_profile_images'
};

/**
 * Generic localStorage operations
 */
export const storage = {
  /**
   * Get item from localStorage
   */
  get(key, defaultValue) {
    if (typeof window === 'undefined') return defaultValue;

    try {
      const item = localStorage.getItem(key);
      if (item === null) return defaultValue;
      return JSON.parse(item);
    } catch (error) {
      console.error(`Error reading from localStorage key "${key}":`, error);
      return defaultValue;
    }
  },

  /**
   * Set item in localStorage
   */
  set(key, value) {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to localStorage key "${key}":`, error);
    }
  },

  /**
   * Remove item from localStorage
   */
  remove(key) {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  },

  /**
   * Clear all ReproServe data from localStorage
   */
  clearAll() {
    if (typeof window === 'undefined') return;
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  }
};

/**
 * User-specific storage operations
 * Data is stored per user ID to support multiple users
 */
export const userStorage = {
  /**
   * Get user-specific key
   */
  getUserKey(userId, baseKey) {
    if (!userId) return baseKey;
    return `${baseKey}_${userId}`;
  },

  /**
   * Get item for specific user
   */
  get(userId, key, defaultValue) {
    return storage.get(userStorage.getUserKey(userId, key), defaultValue);
  },

  /**
   * Set item for specific user
   */
  set(userId, key, value) {
    storage.set(userStorage.getUserKey(userId, key), value);
  },

  /**
   * Remove item for specific user
   */
  remove(userId, key) {
    storage.remove(userStorage.getUserKey(userId, key));
  }
};

/**
 * Specific storage functions for different data types
 */
export const quoteRequestsStorage = {
  get(userId) {
    return userStorage.get(userId, STORAGE_KEYS.QUOTE_REQUESTS, []);
  },
  set(userId, data) {
    userStorage.set(userId, STORAGE_KEYS.QUOTE_REQUESTS, data);
  }
};

export const openHousesStorage = {
  get() {
    return storage.get(STORAGE_KEYS.OPEN_HOUSES, []);
  },
  set(data) {
    storage.set(STORAGE_KEYS.OPEN_HOUSES, data);
  }
};

export const providerBidsStorage = {
  get(providerId) {
    return userStorage.get(providerId, STORAGE_KEYS.PROVIDER_BIDS, {});
  },
  set(providerId, data) {
    userStorage.set(providerId, STORAGE_KEYS.PROVIDER_BIDS, data);
  }
};

export const projectGalleryStorage = {
  get(providerId) {
    return userStorage.get(providerId, STORAGE_KEYS.PROJECT_GALLERY, []);
  },
  set(providerId, data) {
    userStorage.set(providerId, STORAGE_KEYS.PROJECT_GALLERY, data);
  }
};

export const profileDataStorage = {
  get(userId) {
    return userStorage.get(userId, STORAGE_KEYS.PROFILE_DATA, null);
  },
  set(userId, data) {
    userStorage.set(userId, STORAGE_KEYS.PROFILE_DATA, data);
  }
};

export const notificationSettingsStorage = {
  get(userId) {
    return userStorage.get(userId, STORAGE_KEYS.NOTIFICATION_SETTINGS, {
      email: true,
      push: true,
      openHouse: true,
      quoteRequest: true,
      bidSubmission: true
    });
  },
  set(userId, data) {
    userStorage.set(userId, STORAGE_KEYS.NOTIFICATION_SETTINGS, data);
  }
};

export const showMyPropertyStorage = {
  get(userId) {
    return userStorage.get(userId, STORAGE_KEYS.SHOW_MY_PROPERTY_REQUESTS, []);
  },
  set(userId, data) {
    userStorage.set(userId, STORAGE_KEYS.SHOW_MY_PROPERTY_REQUESTS, data);
  }
};

export const recentLeadsStorage = {
  get(providerId) {
    return userStorage.get(providerId, STORAGE_KEYS.RECENT_LEADS, []);
  },
  set(providerId, data) {
    userStorage.set(providerId, STORAGE_KEYS.RECENT_LEADS, data);
  }
};

export const userProjectsStorage = {
  get(userId) {
    return userStorage.get(userId, STORAGE_KEYS.USER_PROJECTS, []);
  },
  set(userId, data) {
    userStorage.set(userId, STORAGE_KEYS.USER_PROJECTS, data);
  }
};

export const favoriteProvidersStorage = {
  get(userId) {
    return userStorage.get(userId, STORAGE_KEYS.FAVORITE_PROVIDERS, []);
  },
  set(userId, data) {
    userStorage.set(userId, STORAGE_KEYS.FAVORITE_PROVIDERS, data);
  }
};

export const savedQuotesStorage = {
  get(userId) {
    return userStorage.get(userId, STORAGE_KEYS.SAVED_QUOTES, []);
  },
  set(userId, data) {
    userStorage.set(userId, STORAGE_KEYS.SAVED_QUOTES, data);
  }
};

export const currentUserStorage = {
  get() {
    return storage.get(STORAGE_KEYS.CURRENT_USER, null);
  },
  set(user) {
    storage.set(STORAGE_KEYS.CURRENT_USER, user);
  },
  clear() {
    storage.remove(STORAGE_KEYS.CURRENT_USER);
  }
};

/**
 * Profile Image Storage
 * Stores profile images as base64 strings keyed by user ID
 */
export const profileImageStorage = {
  get(userId) {
    const images = storage.get(STORAGE_KEYS.PROFILE_IMAGES, {});
    return images[userId] || null;
  },
  set(userId, imageBase64) {
    const images = storage.get(STORAGE_KEYS.PROFILE_IMAGES, {});
    images[userId] = imageBase64;
    storage.set(STORAGE_KEYS.PROFILE_IMAGES, images);
  },
  remove(userId) {
    const images = storage.get(STORAGE_KEYS.PROFILE_IMAGES, {});
    delete images[userId];
    storage.set(STORAGE_KEYS.PROFILE_IMAGES, images);
  }
};