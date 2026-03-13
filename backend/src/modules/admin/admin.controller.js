const User = require('../../models/User');
const Listing = require('../../models/Listing');
const ScrapTransaction = require('../../models/ScrapTransaction');
const Config = require('../../models/Config');

// GET /api/admin/stats
exports.getStats = async (req, res) => {
    const [totalUsers, totalListings, totalEarnings, totalScrap] = await Promise.all([
        User.countDocuments(),
        Listing.countDocuments(),
        ScrapTransaction.aggregate([{ $group: { _id: null, total: { $sum: '$grossAmount' }, commission: { $sum: '$commissionAmount' } } }]),
        ScrapTransaction.aggregate([{ $group: { _id: null, totalWeight: { $sum: '$weight' } } }]),
    ]);

    res.json({
        success: true,
        stats: {
            users: totalUsers,
            listings: totalListings,
            revenue: totalEarnings[0]?.total || 0,
            commission: totalEarnings[0]?.commission || 0,
            scrapWeight: totalScrap[0]?.totalWeight || 0,
        },
    });
};

// GET /api/admin/users
exports.getAllUsers = async (req, res) => {
    const users = await User.find().sort('-createdAt');
    res.json({ success: true, users });
};

// PUT /api/admin/users/:id/ban
exports.banUser = async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    user.isBanned = !user.isBanned;
    await user.save();
    res.json({ success: true, message: `User ${user.isBanned ? 'banned' : 'unbanned'}.`, user });
};

// PUT /api/admin/users/:id/approve
exports.approveKabadiwala = async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    user.isApproved = true;
    await user.save();
    res.json({ success: true, message: 'Kabadiwala approved.', user });
};

// GET /api/admin/config
exports.getConfig = async (req, res) => {
    const configs = await Config.find();
    const configMap = configs.reduce((acc, c) => ({ ...acc, [c.key]: c.value }), {
        commissionPct: 5,
        conversionDays: 30,
    });
    res.json({ success: true, config: configMap });
};

// PUT /api/admin/config
exports.updateConfig = async (req, res) => {
    const { key, value } = req.body;
    await Config.findOneAndUpdate(
        { key },
        { key, value, updatedBy: req.user._id },
        { upsert: true, new: true }
    );
    res.json({ success: true, message: 'Config updated.' });
};
