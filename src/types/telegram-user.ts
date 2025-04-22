export interface TelegramUser {
  _id: string;
  userId: number;
  botId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  languageCode?: string;
  isPremium: boolean;
  clickedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TelegramUserResponse {
  users: TelegramUser[];
  total: number;
} 