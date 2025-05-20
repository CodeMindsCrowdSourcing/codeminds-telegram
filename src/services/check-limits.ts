import { CheckLimitsModel } from '@/models/check-limits';
import connectDB from '@/lib/mongodb';

const DAILY_LIMIT = 100;
const MIN_CHECK_INTERVAL = 2000; // 2 seconds in milliseconds
const BATCH_SIZE = 50;

export class CheckLimitsService {
  static async canCheck(userId: string): Promise<{
    canCheck: boolean;
    error?: string;
    timeToWait?: number;
  }> {
    try {
      await connectDB();
      const userLimits = await CheckLimitsModel.findOne({ userId: userId.toString() });

      if (!userLimits) {
        // First time checking, create new limits
        await CheckLimitsModel.create({ userId: userId.toString() });
        return { canCheck: true };
      }

      // Check daily limit
      if (userLimits.dailyChecks >= DAILY_LIMIT) {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        const timeToWait = tomorrow.getTime() - now.getTime();

        return {
          canCheck: false,
          error: `Daily limit reached. Please wait until tomorrow.`,
          timeToWait
        };
      }

      // Check time interval
      const timeSinceLastCheck = Date.now() - userLimits.lastCheckTime.getTime();
      if (timeSinceLastCheck < MIN_CHECK_INTERVAL) {
        return {
          canCheck: false,
          error: `Please wait ${((MIN_CHECK_INTERVAL - timeSinceLastCheck) / 1000).toFixed(1)} seconds between checks`,
          timeToWait: MIN_CHECK_INTERVAL - timeSinceLastCheck
        };
      }

      return { canCheck: true };
    } catch (error) {
      return { canCheck: false, error: 'Error checking limits' };
    }
  }

  static async incrementChecks(userId: string): Promise<void> {
    try {
      await connectDB();
      await CheckLimitsModel.findOneAndUpdate(
        { userId: userId.toString() },
        {
          $inc: { dailyChecks: 1 },
          lastCheckTime: new Date()
        },
        { upsert: true }
      );
    } catch (error) {
    }
  }

  static validateBatchSize(size: number): {
    isValid: boolean;
    error?: string;
  } {
    if (size > BATCH_SIZE) {
      return {
        isValid: false,
        error: `Batch size cannot exceed ${BATCH_SIZE} numbers`
      };
    }
    return { isValid: true };
  }

  static async processBatch(
    phones: string[],
    userId: string,
    processFunction: (phones: string[]) => Promise<any>
  ): Promise<{ success: boolean; error?: string; results?: any }> {
    // Validate batch size
    const batchValidation = this.validateBatchSize(phones.length);
    if (!batchValidation.isValid) {
      return { success: false, error: batchValidation.error };
    }

    // Check if we can process
    const checkResult = await this.canCheck(userId);
    if (!checkResult.canCheck) {
      return { success: false, error: checkResult.error };
    }

    try {
      // Process the batch
      const results = await processFunction(phones);

      // Increment check count
      await this.incrementChecks(userId);

      return { success: true, results };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error processing batch'
      };
    }
  }
}
