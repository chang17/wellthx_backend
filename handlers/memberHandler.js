const memberService = require('../services/memberService');
// Register New Member (Sign Up)
const registerMember = async (req, res) => {
    try {
        const member = await memberService.registerMember(req.body);
        res.status(201).json(member);
    } catch (error) {
        return res.status(400).json({ code: "E001", message: error.message });
    }
};
// Get All Members
const getAllMembers = async (req, res) => {
    try {
        const members = await memberService.getAllMembers();
        return res.status(200).json({ code: "S001", message: "Success", data: members});
    } catch (error) {
        return res.status(500).json({ code: "E001", message: error.message });
    }
};
// Get specific Member profile
const getMemberById = async (req, res) => {
    try {
        const member = await memberService.getMemberById(req.params.id);
        if (!member) return res.status(404).json({ message: 'Member not found' });
        return res.status(200).json({ code: "S001", message: "Success", data: member});
    } catch (error) {
        return res.status(500).json({ code: "E001", message: error.message });
    }
};
// Update member details
const updateMember = async (req, res) => {
    try {
        const updatedMember = await memberService.updateMember(req.params.id, req.body);
        return res.status(200).json({ code: "S001", message: "Success", data: updatedMember});
    } catch (error) {
        return res.status(400).json({ code: "E002", message: error.message });
    }
};
// Get Direct Sponsors Members
const getDownline = async (req, res) => {
    try {
        const downline = await memberService.getDownline(req.params.id);
        return res.status(200).json({ code: "S001", message: "Success", data: downline});
    } catch (error) {
        return res.status(500).json({ code: "E001", message: error.message });
    }
};
// Get Sponsors
const getSponsor = async (req, res) => {
    try {
        const sponsor = await memberService.getSponsor(req.params.id);
        return res.status(200).json({ code: "S001", message: "Success", data: sponsor});
    } catch (error) {
        return res.status(500).json({ code: "E001", message: error.message });
    }
};
// getDownlineTree 
const getDownlineTree  = async (req, res) => {
    try {
        const sponsor = await memberService.getDownlineTree (req);
        return res.status(200).json({ code: "S001", message: "Success", data: sponsor});
    } catch (error) {
        return res.status(500).json({ code: "E001", message: error.message });
    }
};
// get Downline by username
const searchDownlineByUsername  = async (req, res) => {
    try {
        const { username } = req.params;
        const sponsorId = req.user.id; // Extract from JWT token middleware
        console.log("username : " , username);
        console.log("sponsorId : " , sponsorId);
        const result = await memberService.searchDownline(sponsorId, username);

        return res.status(200).json({ code: "S001", message: "Success", data: result});
    } catch (error) {
        return res.status(500).json({ code: "E001", message: error.message });
    }
};

// Purchase package for member
const purchasePackageForMember  = async (req, res) => {
    try {
        const result = await memberService.purchasePackageForMember(
            req.body.sponsorId,
            req.body.userId,
            req.body.memberId,
            req.body.packageId,
            req.body.username);
            return res.status(200).json({ code: "S001", message: "Success", data: result});
    } catch (error) {
        return res.status(500).json({ code: "E001", message: error.message });
    }
};

const placeMember = async (req, res) => {
    try {
        const { memberId, sponsorId, position } = req.body;

        if (!memberId || !sponsorId || !position) {
            return res.status(400).json({ code: "E002", message: "Missing required fields." });
        }

        const result = await memberService.placeMember(memberId, sponsorId, position);

        res.status(200).json(result);
    } catch (error) {
        console.error("Error in placeMember:", error);
        res.status(500).json({ code: "E003", message: "Internal Server Error", error: error.message });
    }
};



const getPlacementNetwork = async (req, res) => {
    try {
        const { memberId } = req.params;
        const network = await memberService.getMemberPlacementNetwork(memberId);
        return res.status(200).json({ code: "S001", message: "Success", data: network });
    } catch (error) {
        console.error("Error fetching placement network:", error);
        return res.status(500).json({ code: "E001", message: "Failed to fetch placement network", error: error.message });
    }
};

const repurchase = async (req, res) => {
    try {
        const { memberId, subMemberId } = req.body;

        // Call service layer to handle repurchase
        const result = await memberService.repurchaseForMember(memberId, subMemberId, 1);

        if (result.success) {
            return res.status(200).json({
                code: "S001",
                message: result.message,
                data: {
                    newSubAccountId: result.newSubAccountId,
                    newSubUsername: result.newSubUsername
                }
            });
        } else {
            return res.status(400).json({
                code: "E003",
                message: result.message,
                error: result.error
            });
        }
    } catch (error) {
        console.error("Repurchase Error:", error);
        return res.status(500).json({
            code: "E001",
            message: "An unexpected error occurred.",
            error: error.message
        });
    }
};


//Get All Account for member
const getAllAccounts = async (req, res) => {
    try {
        const { userId } = req.params;
        const members = await memberService.getAllAccounts(userId);
        return res.status(200).json({
            code: "S001",
            message: "Success",
            data: {
                count: members.length,
                accounts: members
            }
        });
        
    } catch (error) {
        res.status(500).json({ code: "E001", message: error.message });
    }
};
module.exports = {
    registerMember,
    getAllMembers,
    getMemberById,
    updateMember,
    getDownline,
    getSponsor,
    getDownlineTree,
    searchDownlineByUsername,
    purchasePackageForMember,
    placeMember,
    getPlacementNetwork,
    repurchase,
    getAllAccounts
};
