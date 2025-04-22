export interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: TelegramUser;
    chat: TelegramChat;
    date: number;
    text?: string;
    new_chat_members?: TelegramUser[];
  };
  callback_query?: {
    id: string;
    from: TelegramUser;
    message?: {
      chat: TelegramChat;
      message_id: number;
      date: number;
      text?: string;
    };
    data?: string;
  };
  my_chat_member?: {
    chat: TelegramChat;
    from: TelegramUser;
    date: number;
    old_chat_member: {
      user: TelegramUser;
      status: 'creator' | 'administrator' | 'member' | 'restricted' | 'left' | 'kicked';
    };
    new_chat_member: {
      user: TelegramUser;
      status: 'creator' | 'administrator' | 'member' | 'restricted' | 'left' | 'kicked';
    };
  };
}

export interface TelegramUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

export interface TelegramChat {
  id: number;
  type: 'private' | 'group' | 'supergroup' | 'channel';
  title?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
}

export interface InlineKeyboardButton {
  text: string;
  url?: string;
  callback_data?: string;
}

export interface InlineKeyboardMarkup {
  inline_keyboard: InlineKeyboardButton[][];
}

export interface SendPhotoParams {
  chat_id: number | string;
  photo: string;
  caption?: string;
  reply_markup?: InlineKeyboardMarkup;
}

export interface TelegramResponse<T> {
  ok: boolean;
  result: T;
  description?: string;
  error_code?: number;
} 