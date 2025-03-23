/**
 * POST /api/member/register → Registers a new member.
 * GET /api/member → Retrieves all members.
 * GET /api/member/:id → Gets a specific member by ID.
 * PUT /api/member/:id → Updates a member.
 * GET /api/member/:id/downline → Retrieves all direct downline members.
 * GET /api/member/:id/sponsor → Retrieves sponsor details.
 */
const express = require('express');
const router = express.Router();
const memberHandler = require('../handlers/memberHandler');
const authMiddleware = require('../middleware/authMiddleware');
// Get All Members
router.get('/', authMiddleware, memberHandler.getAllMembers);
// Get specific Member profile
router.get('/:id', authMiddleware, memberHandler.getMemberById);
// Register New Member (Sign Up)
router.post('/', authMiddleware, memberHandler.registerMember);
// Update member details
router.patch('/:id', authMiddleware, memberHandler.updateMember);
// Get Direct Sponsors Members
router.get('/:id/downline', authMiddleware, memberHandler.getDownline);
// Get Sponsors
router.get('/:id/sponsor', authMiddleware, memberHandler.getSponsor);
//Get downline by sponsor id
router.get('/downline/:sponsorId', authMiddleware, memberHandler.getDownlineTree);
// Search downline by username
router.get("/search/downline/:username", authMiddleware, memberHandler.searchDownlineByUsername);
//Purchase package for member
router.post("/purchasepackage", authMiddleware, memberHandler.purchasePackageForMember);
//placement for new member
router.post("/placement",authMiddleware,  memberHandler.placeMember);
//Get placement network diagram
router.get("/placementnetwork/:memberId",authMiddleware,  memberHandler.getPlacementNetwork);
//Get repurchase
router.post("/repurchase",authMiddleware,  memberHandler.repurchase);
//Get subaccount
router.get("/subaccount/:userId",authMiddleware,  memberHandler.getAllAccounts);
module.exports = router;
