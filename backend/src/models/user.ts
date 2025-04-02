export interface User {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  created_at: Date;
}
