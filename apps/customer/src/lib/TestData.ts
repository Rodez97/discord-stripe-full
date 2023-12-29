import { UserSubscription } from "@stripe-discord/types";

// Function to generate random string of given length
const generateRandomString = (length: number): string => {
  const characters =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const generateTestDataSet = (count: number): UserSubscription[] => {
  const testData: UserSubscription[] = [];

  for (let i = 0; i < count; i++) {
    testData.push({
      userId: generateRandomString(10),
      subscriptionId: generateRandomString(10),
      subscriptionStatus: i % 2 === 0 ? "active" : "canceled",
      customerId: generateRandomString(8),
      guildId: generateRandomString(12),
      roles: ["Member", "Subscriber"],
      sellerId: generateRandomString(8),
      guildName: `TestGuild${i + 1}`,
      guildIcon: "",
      tierId: `Tier${i + 1}`,
    });
  }

  return testData;
};

// Example usage
export const testUserData: UserSubscription[] = generateTestDataSet(25);
