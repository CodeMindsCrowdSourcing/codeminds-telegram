import type { TelegramBot } from '@/types/telegram-bot';
import type { TelegramResponse, TelegramUpdate, InlineKeyboardMarkup } from '@/types/telegram-api';
import { TelegramUserModel } from '@/models/telegram-user';
import connectToDatabase from '@/lib/mongodb';
import { TelegramBotModel } from '@/models/telegram-bot';

const TELEGRAM_API_BASE = 'https://api.telegram.org/bot';

let botRunning = new Map<string, boolean>();

function formatUserInfo(update: TelegramUpdate): string {
  const user = update.message?.from;
  if (!user) return 'No user information available';

  const info = ['User info:'];

  // Username
  if (user.username) {
    info.push(`@${user.username}`);
  }

  // User ID
  info.push(`Id: ${user.id}`);

  // First Name
  info.push(`First: ${user.first_name}`);

  // Last Name
  if (user.last_name) {
    info.push(`Last: ${user.last_name}`);
  }

  // Is Bot
  info.push(`Is Bot: ${user.is_bot ? 'Yes' : 'No'}`);

  return info.join('\n');
}


async function handleMessage(bot: TelegramBot, update: TelegramUpdate) {
  if (!update.message?.chat.id) return;

  try {
    const chatId = update.message.chat.id;
    const messageText = update.message.text;

    // Handle /start command
    if (messageText === '/start') {
      const userInfo = formatUserInfo(update);
      await sendMessage(bot.token, chatId, userInfo);
      return;
    }

  } catch (error) {
    throw new Error("Failed to handle message: " + error);
  }
}

async function handleCallback(bot: TelegramBot, update: TelegramUpdate) {
  if (!update.callback_query) return;

  const user = update.callback_query.from;
  const chatId = update.callback_query.message?.chat.id;

  if (!chatId) return;

  try {
    await connectToDatabase();

    // Save user data
    const telegramUser = await TelegramUserModel.findOneAndUpdate(
      { botId: bot.id, userId: user.id },
      {
        botId: bot.id,
        userId: user.id,
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
        languageCode: user.language_code,
        isPremium: user.is_premium,
        clickedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    // Update bot's users array if this is a new user
    await TelegramBotModel.findByIdAndUpdate(
      bot.id,
      {
        $addToSet: { users: telegramUser._id }
      }
    );

    // Send personal message to user with author link button
    const keyboard: InlineKeyboardMarkup = {
      inline_keyboard: [[
        {
          text: '👤 Открыть профиль',
          url: `tg://user?id=${bot.authorId}`
        }
      ]]
    };

    // Send message with button to the user who clicked
    await sendMessage(
      bot.token,
      user.id, // Send to user's private chat
      'Спасибо за интерес! Нажмите на кнопку ниже, чтобы открыть профиль автора:',
      keyboard
    );

    // Answer callback query to remove loading state
    await fetch(
      `${TELEGRAM_API_BASE}${bot.token}/answerCallbackQuery`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          callback_query_id: update.callback_query.id,
          text: 'Проверьте личные сообщения от бота 👆',
          show_alert: true
        }),
      }
    );
  } catch (error) {
    throw new Error("Error handling callback: " + error);
  }
}

async function handleMyChatMember(bot: TelegramBot, update: TelegramUpdate) {
  const myChatMember = update.my_chat_member;
  if (!myChatMember) return;

  const newStatus = myChatMember.new_chat_member.status;
  const oldStatus = myChatMember.old_chat_member.status;
  const chatId = myChatMember.chat.id;

  // Check if bot was just added as administrator
  if (newStatus === 'administrator' && oldStatus !== 'administrator') {
    try {
      // Create inline keyboard with callback data
      const keyboard: InlineKeyboardMarkup = {
        inline_keyboard: [[
          {
            text: bot.buttonText,
            callback_data: 'contact_author'
          }
        ]]
      };

      // Send message with button
      await sendMessage(bot.token, chatId, bot.infoText, keyboard);
    } catch (error) {
      throw new Error('Error sending welcome message:');
    }
  }
}

export async function startBot(bot: TelegramBot): Promise<void> {
  try {
    // Mark bot as running
    botRunning.set(bot.id, true);

    // Delete webhook if exists
    await fetch(`${TELEGRAM_API_BASE}${bot.token}/deleteWebhook`);

    // Start long polling
    let offset = 0;
    while (botRunning.get(bot.id)) {
      try {
        const updates = await getUpdates(bot.token, offset);
        if (!updates || !updates.ok) break;

        for (const update of updates.result) {
          try {
            // Handle callback queries (button clicks)
            if (update.callback_query) {
              await handleCallback(bot, update);
              continue;
            }

            // Handle my_chat_member updates
            if (update.my_chat_member) {
              await handleMyChatMember(bot, update);
              continue;
            }

            // Handle messages
            if (update.message) {
              await handleMessage(bot, update);
            }
          } catch (error) {
            throw new Error('Error processing update:');
          }
        }

        if (updates.result.length > 0) {
          offset = updates.result[updates.result.length - 1].update_id + 1;
        }
      } catch (error) {
        await new Promise(resolve => setTimeout(resolve, 5000));
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  } catch (error) {
    throw error;
  } finally {
    botRunning.delete(bot.id);
  }
}

export async function stopBot(bot: TelegramBot): Promise<void> {
  botRunning.set(bot.id, false);
}

async function getUpdates(token: string, offset: number = 0): Promise<TelegramResponse<TelegramUpdate[]>> {
  const response = await fetch(
    `${TELEGRAM_API_BASE}${token}/getUpdates?offset=${offset}&timeout=30`
  );
  return await response.json();
}

async function sendMessage(
  token: string,
  chatId: number,
  text: string,
  reply_markup?: InlineKeyboardMarkup
): Promise<TelegramResponse<any>> {
  const response = await fetch(
    `${TELEGRAM_API_BASE}${token}/sendMessage`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        reply_markup,
      }),
    }
  );
  return await response.json();
}
