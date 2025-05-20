export interface TelegramBot {
  _id: string;
  id: string;
  name: string;
  token: string;
  owner: string;
  isRunning: boolean;
  buttonText: string;
  infoText: string;
  authorId: string;
  linkImage: string;
  createdAt: string;
  updatedAt: string;
  messagePrivateMessage: string;
  messageOnClick?: string;
}
