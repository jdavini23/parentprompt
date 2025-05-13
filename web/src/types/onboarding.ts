export interface OnboardingFormData {
  childName: string;
  childBirthdate: string;
  childInterests: string[];
  notificationTime: string;
  notificationMethod: 'email' | 'push' | '';
}
