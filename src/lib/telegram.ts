import type { TelegramBot } from '@/types/telegram-bot';
import type {
  TelegramResponse,
  TelegramUpdate,
  InlineKeyboardMarkup
} from '@/types/telegram-api';
import { TelegramUserModel } from '@/models/telegram-user';
import connectToDatabase from '@/lib/mongodb';
import { TelegramBotModel } from '@/models/telegram-bot';
import TelegramGroup from '@/models/telegram-group';

const TELEGRAM_API_BASE = 'https://api.telegram.org/bot';

// Track running bots and their polling promises
let botRunning = new Map<string, boolean>();
let botPolling = new Map<string, Promise<void>>();

// Simple logger
const logger = {
  info: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.info(`[Telegram Bot] ${message}`, ...args);
    }
  },
  error: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.error(`[Telegram Bot] ${message}`, ...args);
    }
  },
  warn: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[Telegram Bot] ${message}`, ...args);
    }
  }
};

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
    throw new Error('Failed to handle message: ' + error);
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
        clickedAt: new Date()
      },
      { upsert: true, new: true }
    );

    // Update bot's users array if this is a new user
    await TelegramBotModel.findByIdAndUpdate(bot.id, {
      $addToSet: { users: telegramUser._id }
    });

    // Send personal message to user with author link button
    const keyboard: InlineKeyboardMarkup = {
      inline_keyboard: [
        [
          {
            text: `${bot.buttonPrivateMessage}`,
            url: `tg://user?id=${bot.authorId}`
          }
        ]
      ]
    };

    // Send message with button to the user who clicked
    await sendMessage(
      bot.token,
      user.id, // Send to user's private chat
      `${bot.messagePrivateMessage}`,
      keyboard
    );

    // Answer callback query to remove loading state
    await fetch(`${TELEGRAM_API_BASE}${bot.token}/answerCallbackQuery`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        callback_query_id: update.callback_query.id,
        text: bot.messageOnClick,
        show_alert: true
      })
    });
  } catch (error) {
    throw new Error('Error handling callback: ' + error);
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
      // Сохраняем группу в базе
      await TelegramGroup.findOneAndUpdate(
        { botId: bot.id, groupId: chatId },
        { botId: bot.id, groupId: chatId, groupName: myChatMember.chat.title },
        { upsert: true, new: true }
      );

      // Create inline keyboard with callback data
      const keyboard: InlineKeyboardMarkup = {
        inline_keyboard: [
          [
            {
              text: bot.buttonText,
              callback_data: 'contact_author'
            }
          ]
        ]
      };

      // Send media with caption if available
      if (bot.linkImage) {
        const isVideo = bot.linkImage.endsWith('.mp4');
        if (isVideo) {
          await sendVideo(bot.token, chatId, bot.linkImage, {
            caption: bot.infoText,
            reply_markup: keyboard
          });
        } else {
          await sendPhoto(bot.token, chatId, bot.linkImage, {
            caption: bot.infoText,
            reply_markup: keyboard
          });
        }
      } else {
        // Send message with button if no media
        await sendMessage(bot.token, chatId, bot.infoText, keyboard);
      }
    } catch (error) {
      throw new Error('Error sending welcome message:');
    }
  }
}

// Helper function to ensure only one instance is running
async function ensureSingleInstance(bot: TelegramBot): Promise<void> {
  // If there's an existing polling promise, wait for it to complete
  const existingPolling = botPolling.get(bot.id);
  if (existingPolling) {
    botRunning.set(bot.id, false); // Signal the existing instance to stop
    try {
      await existingPolling; // Wait for the existing polling to finish
    } catch (error) {
      // Ignore errors from the previous instance
      logger.info('Previous bot instance stopped');
    }
    botPolling.delete(bot.id);
  }
}

async function processScheduledMessages(bot: TelegramBot) {
  await connectToDatabase();
  const groups = await TelegramGroup.find({ botId: bot.id });

  for (const group of groups) {
    let updated = false;
    for (const msg of group.messages) {
      if (!msg.enabled) continue;
      const now = new Date();
      const last = msg.lastSentAt ? new Date(msg.lastSentAt) : null;
      const shouldSend =
        !last || (now.getTime() - last.getTime()) / 1000 >= msg.delay;

      if (shouldSend) {
        try {
          let reply_markup = undefined;
          if (msg.buttonText && msg.buttonUrl) {
            reply_markup = {
              inline_keyboard: [[{ text: msg.buttonText, url: msg.buttonUrl }]]
            };
          }
          if (msg.video) {
            await sendVideo(bot.token, group.groupId, msg.video, {
              caption: msg.text,
              reply_markup
            });
          } else if (msg.image) {
            await sendPhoto(bot.token, group.groupId, msg.image, {
              caption: msg.text,
              reply_markup
            });
          } else {
            await sendMessage(bot.token, group.groupId, msg.text, reply_markup);
          }
          msg.lastSentAt = now;
          updated = true;
        } catch (e) {
          // ignore send errors
        }
      }
    }
    if (updated) {
      await group.save();
    }
  }
}

export async function startBot(bot: TelegramBot): Promise<void> {
  try {
    // Ensure no other instance is running
    await ensureSingleInstance(bot);

    // First, test the bot token
    const testResponse = await fetch(`${TELEGRAM_API_BASE}${bot.token}/getMe`);
    const testData = await testResponse.json();

    if (!testResponse.ok || !testData.ok) {
      throw new Error(
        `Invalid bot token or bot not accessible: ${testData.description || 'Unknown error'}`
      );
    }

    // Mark bot as running
    botRunning.set(bot.id, true);

    // Delete webhook if exists
    const webhookResponse = await fetch(
      `${TELEGRAM_API_BASE}${bot.token}/deleteWebhook`
    );
    const webhookData = await webhookResponse.json();

    if (!webhookResponse.ok || !webhookData.ok) {
      throw new Error(
        `Failed to delete webhook: ${webhookData.description || 'Unknown error'}`
      );
    }

    // Create the polling promise
    const pollingPromise = (async () => {
      try {
        // Start long polling
        let offset = 0;
        let retryCount = 0;
        const maxRetries = 5;
        const retryDelay = 5000;

        while (botRunning.get(bot.id)) {
          try {
            const updates = await getUpdates(bot.token, offset);

            if (!updates) {
              throw new Error('No updates received');
            }

            if (!updates.ok) {
              throw new Error(`Telegram API error: ${updates.description}`);
            }

            // Reset retry count on successful update
            retryCount = 0;

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
                logger.error('Error processing update:', error);
                continue;
              }
            }

            if (updates.result.length > 0) {
              offset = updates.result[updates.result.length - 1].update_id + 1;
            }

            await processScheduledMessages(bot);
          } catch (error) {
            retryCount++;
            const errorMessage =
              error instanceof Error ? error.message : 'Unknown error';
            logger.error(
              `Error getting updates (attempt ${retryCount}/${maxRetries}):`,
              errorMessage
            );

            if (retryCount >= maxRetries) {
              throw new Error(
                `Max retries reached, stopping bot. Last error: ${errorMessage}`
              );
            }

            // Wait before retrying
            logger.info(
              `Waiting ${retryDelay}ms before retry ${retryCount}...`
            );
            await new Promise((resolve) => setTimeout(resolve, retryDelay));
          }

          // Small delay between polling requests
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      } catch (error) {
        logger.error('Error in polling loop:', error);
        botRunning.delete(bot.id);
        botPolling.delete(bot.id);
        throw error;
      }
    })();

    // Store the polling promise but don't await it
    botPolling.set(bot.id, pollingPromise);

    // Handle any errors in the background
    pollingPromise.catch((error) => {
      logger.error('Background polling error:', error);
    });
  } catch (error) {
    logger.error('Error starting bot:', error);
    // Make sure to clean up the running state
    botRunning.delete(bot.id);
    botPolling.delete(bot.id);
    throw error instanceof Error
      ? error
      : new Error('Unknown error starting bot');
  }
}

export async function stopBot(bot: TelegramBot): Promise<void> {
  botRunning.set(bot.id, false);

  // Wait for the polling to complete
  const pollingPromise = botPolling.get(bot.id);
  if (pollingPromise) {
    try {
      await pollingPromise;
    } catch (error) {
      // Ignore errors during shutdown
      logger.warn('Bot stopped with error:', error);
    }
    botPolling.delete(bot.id);
  }
}

async function getUpdates(
  token: string,
  offset: number = 0
): Promise<TelegramResponse<TelegramUpdate[]>> {
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
  const response = await fetch(`${TELEGRAM_API_BASE}${token}/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      reply_markup
    })
  });
  return await response.json();
}

async function sendPhoto(
  token: string,
  chatId: number,
  photo: string,
  options?: {
    caption?: string;
    reply_markup?: InlineKeyboardMarkup;
  }
) {
  const url = `https://api.telegram.org/bot${token}/sendPhoto`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      chat_id: chatId,
      photo: photo,
      caption: options?.caption,
      reply_markup: options?.reply_markup
    })
  });

  if (!response.ok) {
    throw new Error('Failed to send photo');
  }

  return response.json();
}

async function sendVideo(
  token: string,
  chatId: number,
  video: string,
  options?: {
    caption?: string;
    reply_markup?: InlineKeyboardMarkup;
  }
) {
  const url = `https://api.telegram.org/bot${token}/sendVideo`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      chat_id: chatId,
      video: video,
      caption: options?.caption,
      reply_markup: options?.reply_markup
    })
  });

  if (!response.ok) {
    throw new Error('Failed to send video');
  }

  return response.json();
}
