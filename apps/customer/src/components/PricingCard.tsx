"use client";
import { DiscordTierWithPrices } from "@stripe-discord/types";
import React from "react";
import pricingStyle from "../styles/pricing.module.scss";
import VerifiedIcon from "@mui/icons-material/Verified";

type PricingCardProps = {
  tier: DiscordTierWithPrices;
  numberOfTiers: number;
  yearly: boolean;
  openCheckoutSession: (tierId: string, priceId: string) => () => void;
};

const convertPrice = (price: number, currency: string) =>
  Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(price);

function PricingCard({ tier, yearly, openCheckoutSession }: PricingCardProps) {
  return (
    <div className={pricingStyle.planItem}>
      <div className={pricingStyle.card}>
        <div className={pricingStyle.card__header}>
          <VerifiedIcon className={pricingStyle.card__icon} />
          <h2>{tier.nickname}</h2>
        </div>
        {tier.description && (
          <div className={pricingStyle.card__desc}>{tier.description}</div>
        )}
      </div>

      <div className={pricingStyle.price}>
        {convertPrice(
          yearly && tier.yearlyPriceQty
            ? tier.yearlyPriceQty
            : tier.monthlyPriceQty,
          tier.currency
        )}
        <span>/ {yearly ? "year" : "month"}</span>
      </div>

      {tier.benefits && (
        <ul className={pricingStyle.featureList}>
          {tier.benefits.map((benefit) => (
            <li key={benefit}>{benefit}</li>
          ))}
        </ul>
      )}

      <button
        className={pricingStyle.button}
        onClick={openCheckoutSession(
          tier.id,
          yearly && tier.yearlyPriceId
            ? tier.yearlyPriceId
            : tier.monthlyPriceId
        )}
      >
        Get Started
      </button>
    </div>
  );
}

export default PricingCard;
