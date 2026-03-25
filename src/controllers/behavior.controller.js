import { behaviorQueue } from "../queue/behaviorQueue.js";

// track place view
export const trackPlaceView = async (req, res) => {
    try {
        const { place_id } = req.params;

        await behaviorQueue.add("track", {
            user: req.user._id,
            place: place_id,
            action: "view",
        });

        res.json({ message: "view queued" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// track place click
export const trackPlaceClick = async (req, res) => {
    try {
        const { place_id } = req.params;

        await behaviorQueue.add("track", {
            user: req.user._id,
            place: place_id,
            action: "click",
        });

        res.json({ message: "click queued" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// track booking
export const trackPlaceBooking = async (req, res) => {
    try {
        const { place_id } = req.params;

        await behaviorQueue.add("track", {
            user: req.user._id,
            place: place_id,
            action: "booking",
        });

        res.json({ message: "booking queued" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};