export interface OnboardingFormData {
  // User Information
  firstName: string;
  lastName: string;
  phoneNumber: string;
  
  // Child Information
  childName: string;
  childBirthdate: string;
  interests: string[];
  
  // Notification Preferences
  notificationTime: string;
  notificationMethod: 'email' | 'push' | '';
  
  // Internal fields
  userId?: string;
}
