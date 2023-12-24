# Monetize Your Guild

This project is a subscription management system that integrates *Firebase*, *Stripe*, and *Discord*. It allows server owners to monetize their servers and manage user subscriptions effectively.

## Overview

The system is built around the concept of a `UserSubscription`, a TypeScript type that represents a user's subscription to a server. Each `UserSubscription` includes the following information:

- `userId`: The ID of the user who owns the subscription.
- `subscriptionId`: The ID of the subscription.
- `subscriptionStatus`: The status of the subscription (e.g., active, cancelled).
- `customerId`: The ID of the customer in Stripe.
- `guildId`: The ID of the Discord server to which the user is subscribed.
- `roles`: An array of roles that the user has in the server.
- `sellerId`: The ID of the seller (i.e., the server owner).
- `guildName`: The name of the Discord server.
- `guildIcon`: The icon of the Discord server.
- `tierId`: The ID of the subscription tier to which the user is subscribed.

The system uses Firebase for backend services, including Firestore for database management and Firebase Functions for serverless functions. Stripe is used for payment processing, and Discord is used as the platform for the servers.

The project includes a Firestore data converter for the `UserSubscription` type, which allows for easy serialization and deserialization of `UserSubscription` objects to and from Firestore.

This project is a powerful tool for Discord server owners looking to monetize their servers and manage their subscribers effectively. It provides a robust and scalable solution that can handle a large number of users and servers.
