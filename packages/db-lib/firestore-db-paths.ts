import { firestore } from "firebase-admin";
import { customInitApp } from "./firebase-admin-config";
import {
  Customer,
  DiscordTier,
  DiscordTierWithPrices,
  MonetizedServer,
  UserSubscription,
} from "@stripe-discord/types";
import type {
  DocumentData,
  FirestoreDataConverter,
  PartialWithFieldValue,
  QueryDocumentSnapshot,
  WithFieldValue,
} from "firebase-admin/firestore";

customInitApp();

export const AdminCustomerFirestoreConverter: FirestoreDataConverter<Customer> =
  {
    toFirestore(post: PartialWithFieldValue<Customer>): DocumentData {
      return post;
    },
    fromFirestore(snapshot: QueryDocumentSnapshot): Customer {
      const data = snapshot.data();
      return data as Customer;
    },
  };

export const AdminDiscordTierFirestoreConverter: FirestoreDataConverter<DiscordTier> =
  {
    toFirestore(post: DiscordTier): DocumentData {
      return post;
    },
    fromFirestore(snapshot: QueryDocumentSnapshot): DiscordTier {
      const data = snapshot.data();
      const id = snapshot.id;
      return { id, ...data } as DiscordTier;
    },
  };

export const AdminDiscordTierWithPricesFirestoreConverter: FirestoreDataConverter<DiscordTierWithPrices> =
  {
    toFirestore(post: WithFieldValue<DiscordTierWithPrices>): DocumentData {
      return post;
    },
    fromFirestore(snapshot: QueryDocumentSnapshot): DiscordTierWithPrices {
      const data = snapshot.data();
      const id = snapshot.id;
      return { id, ...data } as DiscordTierWithPrices;
    },
  };

export const AdminMonetizedServersFirestoreConverter: FirestoreDataConverter<MonetizedServer> =
  {
    toFirestore(post: MonetizedServer): DocumentData {
      return { ...post };
    },
    fromFirestore(snapshot: QueryDocumentSnapshot): MonetizedServer {
      const data = snapshot.data();
      return data as MonetizedServer;
    },
  };

export const AdminUserSubscriptionFirestoreConverter: FirestoreDataConverter<UserSubscription> =
  {
    toFirestore(post: UserSubscription): DocumentData {
      return post;
    },
    fromFirestore(snapshot: QueryDocumentSnapshot): UserSubscription {
      const data = snapshot.data();
      return data as UserSubscription;
    },
  };

export const TierPaths = {
  collection: firestore()
    .collection("tiers")
    .withConverter(AdminDiscordTierFirestoreConverter),
  userServerTiers: (userId: string, serverId: string) =>
    firestore()
      .collection("tiers")
      .where("sellerId", "==", userId)
      .where("guildId", "==", serverId)
      .withConverter(AdminDiscordTierFirestoreConverter),
  userServerTiersWithPrices: (userId: string, serverId: string) =>
    firestore()
      .collection("tiers")
      .where("sellerId", "==", userId)
      .where("guildId", "==", serverId)
      .withConverter(AdminDiscordTierWithPricesFirestoreConverter),
  tier: (tierId: string) =>
    firestore()
      .collection("tiers")
      .doc(tierId)
      .withConverter(AdminDiscordTierFirestoreConverter),
  tiersByProductId: (productId: string, userId: string) =>
    firestore()
      .collection("tiers")
      .where("productId", "==", productId)
      .where("sellerId", "==", userId)
      .withConverter(AdminDiscordTierFirestoreConverter),
};

export const MonetizedServers = {
  collection: firestore()
    .collection("monetizedServers")
    .withConverter(AdminMonetizedServersFirestoreConverter),
  monetizedServers: (userId: string) =>
    firestore()
      .collection("monetizedServers")
      .where("ownerId", "==", userId)
      .withConverter(AdminMonetizedServersFirestoreConverter),
  monetizedServer: (serverId: string, userId: string) =>
    firestore()
      .collection("monetizedServers")
      .where("ownerId", "==", userId)
      .where(firestore.FieldPath.documentId(), "==", serverId)
      .withConverter(AdminMonetizedServersFirestoreConverter),
  monetizedServerById: (serverId: string) =>
    firestore()
      .collection("monetizedServers")
      .doc(serverId)
      .withConverter(AdminMonetizedServersFirestoreConverter),
};

export const UserSubscriptions = {
  collection: firestore()
    .collection("userSubscriptions")
    .withConverter(AdminUserSubscriptionFirestoreConverter),
  userSubscriptionBySubId: (subscriptionId: string) =>
    firestore()
      .collection("userSubscriptions")
      .doc(subscriptionId)
      .withConverter(AdminUserSubscriptionFirestoreConverter),
  userSubscriptionByUserId: (userId: string) =>
    firestore()
      .collection("userSubscriptions")
      .where("userId", "==", userId)
      .withConverter(AdminUserSubscriptionFirestoreConverter),
  userSubscriptionByServerId: (userId: string, serverId: string) =>
    firestore()
      .collection("userSubscriptions")
      .where("userId", "==", userId)
      .where("guildId", "==", serverId)
      .withConverter(AdminUserSubscriptionFirestoreConverter),
};

export const CustomerPaths = {
  collection: firestore()
    .collection("customers")
    .withConverter(AdminCustomerFirestoreConverter),
  customerByUserId: (userId: string) =>
    firestore()
      .collection("customers")
      .doc(userId)
      .withConverter(AdminCustomerFirestoreConverter),
  customerByCustomerId: (customerId: string) =>
    firestore()
      .collection("customers")
      .where("stripeCustomerId", "==", customerId)
      .withConverter(AdminCustomerFirestoreConverter),
  customerBySubscriptionId: (subscriptionId: string) =>
    firestore()
      .collection("customers")
      .where("stripeSubscriptionId", "==", subscriptionId)
      .withConverter(AdminCustomerFirestoreConverter),
};
