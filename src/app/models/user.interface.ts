export interface User {
  id: number;
  username: string;
  email: string;
  createdAt?: Date;
  updatedAt?: Date;
  // Add any additional fields your user might have
  profile?: {
    firstName?: string;
    lastName?: string;
    avatar?: string;
  };
}

// Interface for user registration data (without id)
export interface RegisterUser
  extends Omit<User, 'id' | 'createdAt' | 'updatedAt'> {
  password: string;
}

// Interface for updating user data
export interface UpdateUser {
  username?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
  profile?: {
    firstName?: string;
    lastName?: string;
    avatar?: string;
  };
}
