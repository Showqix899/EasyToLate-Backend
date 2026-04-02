import Place from "../models/Accomodation.model.js"
import Booking from "../models/booking.model.js"



export const getBookingOverviewAnalytics = async (req, res) => {
    try {

        const analytics = await Booking.aggregate([
            {
                $group: {
                    _id: null,

                    totalBookings: { $sum: 1 },

                    successfulBookings: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "success"] }, 1, 0]
                        }
                    },

                    failedBookings: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "failed"] }, 1, 0]
                        }
                    },

                    pendingBookings: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "pending"] }, 1, 0]
                        }
                    },

                    canceledBookings: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "canceled"] }, 1, 0]
                        }
                    },

                    confirmedBookings: {
                        $sum: {
                            $cond: [{ $eq: ["$isConfirmed", true] }, 1, 0]
                        }
                    },

                    paidBookings: {
                        $sum: {
                            $cond: [{ $eq: ["$isPaid", true] }, 1, 0]
                        }
                    },

                    unpaidBookings: {
                        $sum: {
                            $cond: [{ $eq: ["$isPaid", false] }, 1, 0]
                        }
                    },

                    refundRequests: {
                        $sum: {
                            $cond: [{ $eq: ["$refundStatus", "requested"] }, 1, 0]
                        }
                    },

                    refundedBookings: {
                        $sum: {
                            $cond: [{ $eq: ["$refundStatus", "refunded"] }, 1, 0]
                        }
                    },

                    totalRevenue: {
                        $sum: {
                            $cond: [
                                { $eq: ["$status", "success"] },
                                "$place_rent",
                                0
                            ]
                        }
                    },

                    totalServiceFees: {
                        $sum: {
                            $cond: [
                                { $eq: ["$status", "success"] },
                                "$serviceFee",
                                0
                            ]
                        }
                    }

                }
            },
            {
                $project: {
                    _id: 0
                }
            }
        ])

        const result = analytics[0] || {}

        res.status(200).json({
            success: true,
            data: result
        })

    } catch (error) {

        res.status(500).json({
            success: false,
            message: "Failed to fetch booking analytics",
            error: error.message
        })
    }
}


//get revenue analytics
export const getRevenueAnalytics = async (req, res) => {
    try {

        const { startDate, endDate } = req.query

        const matchStage = {
            status: "success"
        }

        // apply date filters only if provided
        if (startDate || endDate) {

            matchStage.createdAt = {}

            if (startDate) {
                matchStage.createdAt.$gte = new Date(startDate)
            }

            if (endDate) {
                matchStage.createdAt.$lte = new Date(endDate)
            }

        }

        const revenue = await Booking.aggregate([
            {
                $match: matchStage
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    revenue: {
                        $sum: "$place_rent"
                    },
                    bookings: {
                        $sum: 1
                    }
                }
            },
            {
                $sort: {
                    "_id.year": 1,
                    "_id.month": 1
                }
            }
        ])

        res.status(200).json({
            success: true,
            data: revenue
        })

    } catch (error) {

        res.status(500).json({
            success: false,
            message: "Failed to fetch revenue analytics",
            error: error.message
        })
    }
}