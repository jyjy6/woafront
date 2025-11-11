export interface UserInfo {
  id: number;
  username: string;
  displayName: string;
  email: string;
  name?: string;
  phone?: string;
  height?: number;
  weight?: number;
  sex?: string;
  age?: number;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  isPremium: boolean;
  premiumExpiryDate?: string;
  marketingAccepted: boolean;
  roleSet: string[];
  meals?: unknown[];
  workouts?: unknown[];
}

export interface UserInfoForm {
  username: string;
  name: string;
  password: string;
  email: string;
  displayName: string;
  phone?: string;
  sex: string;
  age: number;
  height: number;
  weight: number;
  isPremium?: boolean;
  roles?: string[];
  privacyAccepted: boolean;
  termsAccepted: boolean;
  marketingAccepted: boolean;
}
