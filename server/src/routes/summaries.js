import { Router } from 'express';
import Report from '../models/Report.js';
import { summarizeClinicalText } from '../services/ai.js';

const router = Router();

router.post('/:reportId', async (req, res) => {
  try {
    const report = await Report.findOne({ _id: req.params.reportId });
    if (!report) return res.status(404).json({ message: 'Report not found' });
    if (!report.originalText) return res.status(400).json({ message: 'No text available to summarize' });

    report.status = 'pending';
    await report.save();

    const summaryText = await summarizeClinicalText(report.originalText);
    report.summaryText = summaryText;
    report.status = 'completed';
    await report.save();
    return res.json({ report });
  } catch (e) {
    return res.status(500).json({ message: 'Failed to generate summary' });
  }
});

export default router;
