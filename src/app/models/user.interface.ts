export interface User {
  id: number;
  username: string;
  email: string;
  createdAt?: Date;
  updatedAt?: Date;
  profile?: {
    firstName?: string;
    lastName?: string;
    avatar?: string;
  };
}

export interface RegisterUser
  extends Omit<User, 'id' | 'createdAt' | 'updatedAt'> {
  password: string;
}

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
