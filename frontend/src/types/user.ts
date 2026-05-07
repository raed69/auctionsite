export interface User {
  id: string;
  email: string;
  createdAt: Date;
}

export interface UserProfile {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
}
