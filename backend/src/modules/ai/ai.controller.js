const axios = require('axios');

// POST /api/ai/analyze
exports.analyzeItem = async (req, res) => {
    try {
        // 1. Get AI Analysis from AI Service
        let aiResult;
        try {
            const aiResponse = await axios.post(`${process.env.AI_SERVICE_URL || 'http://localhost:8000'}/analyze-item`, req.body);
            aiResult = aiResponse.data;
        } catch (err) {
            console.error('AI Service Error:', err.message);
            return res.status(503).json({ success: false, message: 'AI Analysis Service is temporarily unavailable.' });
        }

        // 2. Fetch current scrap prices (can be intercepted by Requestly)
        const baseUrl = process.env.BACKEND_URL || 'http://localhost:5000';
        const scrapPricesResponse = await axios.get(`${baseUrl}/api/scrap-prices`);
        const scrapPrices = scrapPricesResponse.data;

        // Default to 'iron' if material_type is missing or not in prices
        const material = aiResult.material_type || 'iron';
        const pricePerKg = scrapPrices[material] || 32;
        const weight = 5; // assume 5kg for demo if not specified

        const dynamicScrapValue = weight * pricePerKg;
        const avgResaleValue = (aiResult.resale_estimate.min + aiResult.resale_estimate.max) / 2;

        // Threshold: if scrap value is more than 60% of resale value, recommend scrap
        const threshold = 0.6;
        const recommendation = dynamicScrapValue > (avgResaleValue * threshold) ? 'scrap' : (aiResult.recommended_mode || 'reuse');

        const finalData = {
            ...aiResult,
            scrap_estimate: dynamicScrapValue,
            recycle_value: aiResult.recycle_value || dynamicScrapValue * 1.2,
            recommended_mode: recommendation,
            scrap_prices_applied: scrapPrices,
            reasoning: recommendation === 'scrap' && aiResult.recommended_mode !== 'scrap'
                ? `🚀 Market spike detected! Material "${material}" is currently priced at ₹${pricePerKg}/kg. Your scrap value (₹${dynamicScrapValue}) is now highly competitive compared to resale value. We recommend Scrapping.`
                : aiResult.reasoning || `Resale value remains higher than the current scrap value (₹${dynamicScrapValue}). We recommend Listing for Resale.`
        };

        console.log(`[LOG] AI Analysis Triggered - Item: ${finalData.identified_item}, Material: ${material}, Price: ₹${pricePerKg}, Scrap Value: ₹${dynamicScrapValue}, Recommendation: ${recommendation}`);

        res.json({ success: true, data: finalData });
    } catch (err) {
        console.error('AI Controller Error:', err.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
