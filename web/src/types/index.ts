/**
 * Type definitions for the ParentPrompt application
 */

/**
 * User profile information
 */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  createdAt: string;
}

/**
 * Child profile information
 */
export interface Child {
  id: string;
  userId: string;
  name: string;
  birthdate: string;
  interests: string[];
  ageGroup?: AgeGroup;
}

/**
 * Age group categories for children
 */
export enum AgeGroup {
  INFANT = 'infant',      // 0-1 years
  TODDLER = 'toddler',    // 1-3 years
  PRESCHOOL = 'preschool', // 3-5 years
  SCHOOL_AGE = 'school-age', // 5-12 years
  TEEN = 'teen',         // 13-18 years
}

/**
 * Prompt types
 */
export enum PromptType {
  CONVERSATION = 'conversation',
  ACTIVITY = 'activity',
  EDUCATIONAL = 'educational',
  REFLECTION = 'reflection',
}

/**
 * Prompt information
 */
export interface Prompt {
  id: string;
  content: string;
  type: PromptType;
  ageGroups: AgeGroup[];
  tags: string[];
  createdAt: string;
}

/**
 * User-specific prompt instance
 */
export interface UserPrompt {
  id: string;
  userId: string;
  promptId: string;
  prompt?: Prompt;
  completed: boolean;
  favorited: boolean;
  scheduledFor?: string;
  deliveredAt?: string;
  notes?: string;
}

/**
 * User preferences
 */
export interface UserPreferences {
  id: string;
  userId: string;
  preferredTime?: string;
  notificationMethod: 'email' | 'sms' | 'push' | 'none';
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  customFrequency?: string;
  categories: PromptType[];
}
