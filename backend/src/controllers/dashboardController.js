import Repository from '../models/Repository.js';
import Conversation from '../models/Conversation.js';
import CodeChunk from '../models/CodeChunk.js';

/**
 * @desc    Get dashboard metrics, user repositories, and recent activities
 * @route   GET /api/dashboard
 * @access  Private
 */
export const getDashboardData = async (req, res) => {
  // 1. Validate authentication & req.user presence
  if (!req.user || !req.user._id) {
    return res.status(401).json({ success: false, message: 'Not authorized, user missing' });
  }

  // 2. Strict User Isolation: Strict ObjectId filter (no legacy fallback)
  const userId = req.user._id;
  const userFilter = { userId };

  try {
    // 3. Execute all count queries and paginated list query in parallel
    const [totalRepoCount, totalIndexedCount, totalConversations, totalChunks, dbRepos] = await Promise.all([
      Repository.countDocuments(userFilter),
      Repository.countDocuments({ ...userFilter, status: 'INDEXED' }),
      Conversation.countDocuments(userFilter),
      CodeChunk.countDocuments(userFilter),
      Repository.find(userFilter)
        .select('-files')
        .sort({ updatedAt: -1 })
        .limit(50)
        .lean(),
    ]);

    // 4. Deduplicate displayed repository list using Set and repoId
    const seenRepoIds = new Set();
    const repositories = [];

    for (const r of dbRepos) {
      const targetId = r.repoId || (r.owner && r.name ? `${r.owner}/${r.name}` : String(r._id));
      if (seenRepoIds.has(targetId)) continue;
      seenRepoIds.add(targetId);

      // 5. Standardized status vocabulary enum & type validation
      repositories.push({
        id: targetId,
        repoId: targetId,
        name: r.name,
        owner: r.owner,
        url: r.url,
        description: r.description || '',
        language: r.language || 'Unknown',
        technologies: Array.isArray(r.technologies) && r.technologies.length > 0 ? r.technologies : [],
        stars: typeof r.stars === 'number' ? r.stars : parseInt(r.stars, 10) || 0,
        forks: typeof r.forks === 'number' ? r.forks : parseInt(r.forks, 10) || 0,
        lastAnalyzed: r.updatedAt ? new Date(r.updatedAt).toISOString() : (r.createdAt ? new Date(r.createdAt).toISOString() : null),
        status: r.status || 'IMPORTED',
        filesCount: r.stats?.files || 0,
      });
    }

    // 7. Metrics statistics configuration
    const stats = [
      {
        id: 'stat_1',
        title: 'Repositories',
        value: String(totalRepoCount),
        trend: `${totalIndexedCount} RAG indexed`,
        type: 'repos',
      },
      {
        id: 'stat_2',
        title: 'AI Conversations',
        value: String(totalConversations),
        trend: 'Active threads',
        type: 'chats',
      },
      {
        id: 'stat_3',
        title: 'Indexed Repos',
        value: String(totalIndexedCount),
        trend: 'Vector ready',
        type: 'analyses',
      },
      {
        id: 'stat_4',
        title: 'Code Vectors',
        value: String(totalChunks),
        trend: 'Vector embeddings',
        type: 'queries',
      },
    ];

    const activities = repositories.slice(0, 5).map((repo, idx) => ({
      id: `act_${idx}`,
      type: 'import',
      title: repo.status === 'INDEXED' ? `RAG Index ready for ${repo.name}` : `Synced repository ${repo.name}`,
      repoName: repo.name,
      repoId: repo.id,
      time: repo.lastAnalyzed,
    }));

    return res.json({
      success: true,
      stats,
      repositories,
      activities,
    });
  } catch (err) {
    console.error(`[Dashboard Controller Error] ${err.stack || err.message}`);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve dashboard data',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};
