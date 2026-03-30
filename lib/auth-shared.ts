export type UserRole = "admin" | "referrer";

export type Session = {
  role: UserRole;
  username: string;
};
