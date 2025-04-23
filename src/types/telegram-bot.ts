export interface TelegramBot {
  id: string;
  name: string;
  token: string;
  isRunning: boolean;
  buttonText: string;
  infoText: string;
  authorId: string;
  linkImage: string;
  createdAt: Date;
  updatedAt: Date;
  buttonPrivateMessage: string;
  messagePrivateMessage: string;
  messageOnClick: string;
} 