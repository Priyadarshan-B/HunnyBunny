const Location = require('../../models/Location');

exports.createLocation = async (req, res) => {
    try {
        const { location} = req.body;

        const locationPost = new Location({
            location
        });

        const savedLocation = await locationPost.save();
        res.status(201).json(savedLocation);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create location', details: error.message });
    }
};

exports.getAllLocations = async (req, res) => {
    try {
        const locations = await Location.find({ status: '1' });
        res.status(200).json(locations);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch locations', details: error.message });
    }
};
