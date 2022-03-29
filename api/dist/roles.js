"use strict";

const roles = {
  NOBODY: 'NOBODY',
  BRONZE_BACKER: 'BRONZE_BACKER',
  SILVER_BACKER: 'SILVER_BACKER',
  GOLD_BACKER: 'GOLD_BACKER',
  SPARKLING_CREATOR: 'SPARKLING_CREATOR',
  EMERALD_SPONSOR: 'EMERALD_SPONSOR',
  RUBY_SPONSOR: 'RUBY_SPONSOR'
};
const tiers = {
  // Anonymous
  0: {
    rate: '10M'
  },
  // Bronze
  1: {
    rate: '20M'
  },
  // Silver
  2: {
    rate: '50M'
  },
  // Gold
  3: {
    rate: '100M'
  },
  // Emerald/Ruby/Sparkling
  4: {
    rate: '250M'
  }
};

function roleToTier(role) {
  let tier = {};
  if (!role) role = roles.NOBODY;

  switch (role) {
    case roles.NOBODY:
      tier = tiers[0];
      break;

    case roles.BRONZE_BACKER:
      tier = tiers[1];
      break;

    case roles.SILVER_BACKER:
      tier = tiers[2];
      break;

    case roles.GOLD_BACKER:
      tier = tiers[3];
      break;

    case roles.EMERALD_SPONSOR:
    case roles.RUBY_SPONSOR:
    case roles.SPARKLING_CREATOR:
      tier = tiers[4];
      break;
  }

  tier.role = role.toLowerCase();
  return tier;
}

module.exports = {
  roles,
  tiers,
  roleToTier
};