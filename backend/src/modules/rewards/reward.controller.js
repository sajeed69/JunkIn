const rewardService = require('./reward.service');

// GET /api/rewards/me — Get eco rewards summary for logged-in user
exports.getMyRewards = async (req, res) => {
    try {
        const summary = await rewardService.getRewardsSummary(req.user._id);
        if (!summary) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, ...summary });
    } catch (err) {
        console.error('[REWARD] Error getting rewards:', err.message);
        res.status(500).json({ success: false, message: 'Failed to fetch rewards' });
    }
};

// POST /api/rewards/scratch/:rewardId — Scratch a reward card
exports.scratchCard = async (req, res) => {
    try {
        const result = await rewardService.scratchReward(req.user._id, req.params.rewardId);
        if (result.error) {
            return res.status(400).json({ success: false, message: result.error, reward: result.reward || null });
        }
        res.json({ success: true, message: 'Reward revealed!', reward: result.reward });
    } catch (err) {
        console.error('[REWARD] Error scratching card:', err.message);
        res.status(500).json({ success: false, message: 'Failed to scratch card' });
    }
};

// POST /api/rewards/award — Manually award points (for testing / admin)
exports.awardPoints = async (req, res) => {
    try {
        const { action } = req.body;
        if (!action) {
            return res.status(400).json({ success: false, message: 'Action is required' });
        }
        const result = await rewardService.awardPoints(req.user._id, action);
        if (!result) {
            return res.status(400).json({ success: false, message: 'Failed to award points' });
        }
        res.json({ success: true, ...result });
    } catch (err) {
        console.error('[REWARD] Error awarding points:', err.message);
        res.status(500).json({ success: false, message: 'Failed to award points' });
    }
};
