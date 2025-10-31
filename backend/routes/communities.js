const express = require('express');
const Community = require('../models/Community');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/communities
router.get('/', async (req, res, next) => {
  try {
    const { search } = req.query;
    const filter = { isActive: true };
    if (search && String(search).trim()) {
      filter.$text = { $search: String(search).trim() };
    }
    const communities = await Community.find(filter)
      .sort({ createdAt: -1 })
      .limit(100);
    res.json({ success: true, data: { communities } });
  } catch (err) {
    next(err);
  }
});

// POST /api/communities
router.post('/', protect, async (req, res, next) => {
  try {
    const { name, description } = req.body || {};
    if (!name || !String(name).trim()) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }
    const community = await Community.create({
      name: String(name).trim(),
      description: description ? String(description).trim() : '',
      createdBy: req.user ? req.user.id : undefined,
    });
    res.status(201).json({ success: true, data: { community } });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/communities/my
// @desc    Get communities user is a member of
// @access  Private
router.get('/my', protect, async (req, res, next) => {
  try {
    const communities = await Community.find({
      'members.user': req.user.id,
      isActive: true,
    }).populate('createdBy', 'name email');
    
    res.json({
      success: true,
      data: {
        communities,
      },
    });
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/communities/:id/join
// @desc    Join a community
// @access  Private
router.post('/:id/join', protect, async (req, res, next) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) {
      return res.status(404).json({ success: false, message: 'Community not found' });
    }
    
    if (!community.isActive) {
      return res.status(400).json({ success: false, message: 'Community is not active' });
    }
    
    // Check if user is already a member
    const isAlreadyMember = community.members.some(member => member.user.toString() === req.user.id);
    if (isAlreadyMember) {
      return res.status(400).json({ success: false, message: 'You are already a member of this community' });
    }
    
    // Check if community is full
    if (community.members.length >= (community.maxMembers || 1000)) {
      return res.status(400).json({ success: false, message: 'Community is full' });
    }
    
    // Add user to members
    community.members.push({
      user: req.user.id,
      role: 'member',
      joinedAt: new Date(),
    });
    
    community.membersCount = community.members.length;
    await community.save();
    
    res.json({
      success: true,
      message: 'Successfully joined community',
      data: {
        community,
      },
    });
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/communities/:id/leave
// @desc    Leave a community
// @access  Private
router.post('/:id/leave', protect, async (req, res, next) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) {
      return res.status(404).json({ success: false, message: 'Community not found' });
    }
    
    // Check if user is a member
    const memberIndex = community.members.findIndex(member => member.user.toString() === req.user.id);
    if (memberIndex === -1) {
      return res.status(400).json({ success: false, message: 'You are not a member of this community' });
    }
    
    // Check if user is the creator (admin)
    if (community.members[memberIndex].role === 'admin') {
      return res.status(400).json({ success: false, message: 'Admin cannot leave community. Transfer ownership first.' });
    }
    
    // Remove user from members
    community.members.splice(memberIndex, 1);
    community.membersCount = community.members.length;
    await community.save();
    
    res.json({
      success: true,
      message: 'Successfully left community',
    });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/communities/:id/membership
// @desc    Check if user is a member of a community
// @access  Private
router.get('/:id/membership', protect, async (req, res, next) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) {
      return res.status(404).json({ success: false, message: 'Community not found' });
    }
    
    const isMember = community.members.some(member => member.user.toString() === req.user.id);
    
    res.json({
      success: true,
      data: {
        isMember,
        community: {
          _id: community._id,
          name: community.name,
          description: community.description,
          membersCount: community.membersCount,
          isActive: community.isActive,
          isPrivate: community.isPrivate,
          maxMembers: community.maxMembers,
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;


