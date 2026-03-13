const User = require('../../models/User');

// ── Point Values ──
const POINT_VALUES = {
    sell: 10,
    scrap_pickup: 8,
    rare_listing: 15,
    referral: 20,
    listing: 3,
};

// ── Reward Tiers ──
const REWARD_TIERS = [
    { threshold: 50, amount: 50, label: '₹50 Gift Card' },
    { threshold: 100, amount: 100, label: '₹100 Gift Card' },
    { threshold: 200, amount: 250, label: '₹250 Gift Card' },
    { threshold: 350, amount: 500, label: '₹500 Premium Gift Card' },
];

// ── Reward Brands (random pick on scratch) ──
const REWARD_BRANDS = [
    { brand: 'Amazon', type: 'gift_card' },
    { brand: 'Flipkart', type: 'gift_card' },
    { brand: 'JunkIn Credits', type: 'credit' },
    { brand: 'Discount Coupon', type: 'coupon' },
];

const MAX_REWARDS_PER_DAY = 3;

/**
 * Award eco points to a user for a completed action.
 * Also checks and unlocks any new rewards.
 */
async function awardPoints(userId, action) {
    const points = POINT_VALUES[action];
    if (!points) {
        console.log(`[ECO] Unknown action: ${action}`);
        return null;
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            console.log(`[ECO] User not found: ${userId}`);
            return null;
        }

        user.eco_points = (user.eco_points || 0) + points;
        user.totalTransactions = (user.totalTransactions || 0) + 1;
        await user.save();

        console.log(`[ECO] +${points} points (${action}) → User ${userId} now has ${user.eco_points} pts`);

        // Check for new reward unlocks
        const newRewards = await checkAndUnlockRewards(userId);

        return {
            points_awarded: points,
            total_points: user.eco_points,
            action,
            new_rewards: newRewards,
        };
    } catch (err) {
        console.error(`[ECO] Error awarding points:`, err.message);
        return null;
    }
}

/**
 * Check if user has crossed any reward thresholds and unlock rewards.
 * Anti-abuse: max 3 rewards per day.
 */
async function checkAndUnlockRewards(userId) {
    try {
        const user = await User.findById(userId);
        if (!user) return [];

        // Anti-abuse: reset daily counter
        const today = new Date().toISOString().slice(0, 10);
        if (user.rewards_today_date !== today) {
            user.rewards_today = 0;
            user.rewards_today_date = today;
        }

        if (user.rewards_today >= MAX_REWARDS_PER_DAY) {
            console.log(`[ECO] Daily reward limit reached for user ${userId}`);
            return [];
        }

        const currentPoints = user.eco_points || 0;
        const existingAmounts = (user.reward_history || []).map((r) => r.amount);
        const newRewards = [];

        for (const tier of REWARD_TIERS) {
            if (currentPoints >= tier.threshold && !existingAmounts.includes(tier.amount)) {
                if (user.rewards_today >= MAX_REWARDS_PER_DAY) break;

                const reward = {
                    rewardType: 'gift_card',
                    amount: tier.amount,
                    label: tier.label,
                    brand: '',       // assigned on scratch
                    scratched: false,
                    claimed: false,
                    unlockedAt: new Date(),
                };

                user.reward_history.push(reward);
                user.rewards_today += 1;
                user.last_reward_timestamp = new Date();
                newRewards.push(reward);

                console.log(`[ECO] 🎁 Reward unlocked: ${tier.label} for user ${userId}`);
            }
        }

        if (newRewards.length > 0) {
            await user.save();
        }

        return newRewards;
    } catch (err) {
        console.error(`[ECO] Error checking rewards:`, err.message);
        return [];
    }
}

/**
 * Scratch a reward card to reveal the brand/type.
 */
async function scratchReward(userId, rewardId) {
    try {
        const user = await User.findById(userId);
        if (!user) return { error: 'User not found' };

        const reward = user.reward_history.id(rewardId);
        if (!reward) return { error: 'Reward not found' };

        if (reward.scratched) {
            return { error: 'Already scratched', reward };
        }

        // Random brand assignment
        const pick = REWARD_BRANDS[Math.floor(Math.random() * REWARD_BRANDS.length)];
        reward.brand = pick.brand;
        reward.rewardType = pick.type;
        reward.scratched = true;
        reward.claimed = true;
        reward.claimedAt = new Date();

        await user.save();

        console.log(`[ECO] 🎉 Scratched! User ${userId} got ${pick.brand} ₹${reward.amount}`);

        return { reward };
    } catch (err) {
        console.error(`[ECO] Error scratching reward:`, err.message);
        return { error: 'Failed to scratch reward' };
    }
}

/**
 * Get user's eco rewards summary.
 */
async function getRewardsSummary(userId) {
    try {
        const user = await User.findById(userId).lean();
        if (!user) return null;

        const points = user.eco_points || 0;
        const history = user.reward_history || [];
        const scratchable = history.filter((r) => !r.scratched);
        const claimed = history.filter((r) => r.claimed);

        // Find next reward tier
        let nextTier = null;
        for (const tier of REWARD_TIERS) {
            if (points < tier.threshold) {
                nextTier = tier;
                break;
            }
        }

        return {
            eco_points: points,
            total_transactions: user.totalTransactions || 0,
            next_reward: nextTier
                ? { threshold: nextTier.threshold, label: nextTier.label, points_remaining: nextTier.threshold - points }
                : null,
            scratch_cards: scratchable,
            claimed_rewards: claimed,
            reward_history: history,
            point_values: POINT_VALUES,
            reward_tiers: REWARD_TIERS,
        };
    } catch (err) {
        console.error(`[ECO] Error getting summary:`, err.message);
        return null;
    }
}

module.exports = {
    awardPoints,
    checkAndUnlockRewards,
    scratchReward,
    getRewardsSummary,
    POINT_VALUES,
    REWARD_TIERS,
};
