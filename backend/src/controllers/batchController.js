import Batch from '../models/Batch.js';

/**
 * @desc    Create a new batch
 * @route   POST /api/batch
 * @access  Admin
 */
export const createBatch = async (req, res, next) => {
    try {
        const { startYear, endYear, sections } = req.body;
        
        if (Number(endYear) <= Number(startYear)) {
            return res.status(400).json({ message: 'End year must be greater than start year' });
        }
        
        // Basic validation
        if (!sections || !Array.isArray(sections) || sections.length === 0) {
            return res.status(400).json({ message: 'At least one section is required.' });
        }

        // Check for duplicate section names
        const sectionNames = sections.map(s => s.name?.trim());
        if (new Set(sectionNames).size !== sectionNames.length) {
            return res.status(400).json({ message: 'Duplicate section names are not allowed.' });
        }

        // Check uniqueness of batch
        const existing = await Batch.findOne({ startYear, endYear });
        if (existing) {
            return res.status(400).json({ message: 'Batch already exists.' });
        }

        const batch = await Batch.create({ startYear, endYear, sections });
        res.status(201).json({ message: 'Batch added successfully', batch });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Get all batches
 * @route   GET /api/batch
 * @access  Private
 */
export const getAllBatches = async (req, res, next) => {
    try {
        const batches = await Batch.find().sort({ startYear: -1 });
        res.json(batches);
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Update a batch
 * @route   PUT /api/batch/:id
 * @access  Admin
 */
export const updateBatch = async (req, res, next) => {
    try {
        const { startYear, endYear, sections } = req.body;

        if (startYear && endYear && Number(endYear) <= Number(startYear)) {
            return res.status(400).json({ message: 'End year must be greater than start year' });
        }

        if (sections) {
            const sectionNames = sections.map(s => s.name?.trim());
            if (new Set(sectionNames).size !== sectionNames.length) {
                return res.status(400).json({ message: 'Duplicate section names are not allowed.' });
            }
        }

        const batch = await Batch.findByIdAndUpdate(
            req.params.id,
            { startYear, endYear, sections },
            { new: true, runValidators: true }
        );
        if (!batch) {
            return res.status(404).json({ message: 'Batch not found' });
        }
        res.json({ message: 'Batch updated successfully', batch });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Delete a batch
 * @route   DELETE /api/batch/:id
 * @access  Admin
 */
export const deleteBatch = async (req, res, next) => {
    try {
        const batch = await Batch.findByIdAndDelete(req.params.id);
        if (!batch) {
            return res.status(404).json({ message: 'Batch not found' });
        }
        res.json({ message: 'Batch deleted successfully' });
    } catch (err) {
        next(err);
    }
};
