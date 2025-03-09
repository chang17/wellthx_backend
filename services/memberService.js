const memberRepository = require('../repositories/memberRepository');

const getFirstLevelMembers = async (userId, limit = 3) => {
    const directMembers = await memberRepository.getDirectSponsors(userId, limit);

    const response = await Promise.all(directMembers.map(async (member) => {
        const hasMore = await memberRepository.hasSubMembers(member.id);
        return { ...member, hasMore, children: [] }; // Children are empty initially
    }));

    return { id: userId, children: response };
};

const getChildrenMembers = async (userId, limit = 3) => {
    const members = await memberRepository.getDirectSponsors(userId, limit);

    return members.map(member => ({
        ...member,
        hasMore: false, // No need to check sub-levels now
        children: []
    }));
};

module.exports = { getFirstLevelMembers, getChildrenMembers };
