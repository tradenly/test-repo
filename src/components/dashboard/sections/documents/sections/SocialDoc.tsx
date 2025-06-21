
export const SocialDoc = () => {
  return (
    <div className="space-y-6 text-gray-200">
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">👥 Social Features & Challenges</h2>
        <p className="text-lg text-gray-300">
          Connect, compete, and earn extra credits through social gaming
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white">Social Platform Overview</h3>
        <div className="bg-gray-800/50 rounded-lg p-4">
          <p className="mb-3">
            The POOPEE social ecosystem goes beyond simple gaming - it's a community-driven platform 
            where players can compete, collaborate, and earn rewards through various social activities. 
            This is where the real magic happens for building and spreading the POOPEE brand!
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Competitive Challenges:</strong> Weekly and daily challenges with real rewards</li>
            <li><strong>Friend Systems:</strong> Connect with other players and form teams</li>
            <li><strong>Leaderboard Competitions:</strong> Climb rankings for exclusive prizes</li>
            <li><strong>Content Creation:</strong> Earn credits for promoting POOPEE</li>
            <li><strong>Referral Programs:</strong> Get rewarded for bringing new players</li>
          </ul>
        </div>

        <h3 className="text-xl font-semibold text-white">Social Challenges</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
            <h4 className="font-semibold text-blue-400 mb-2">🏆 Daily Challenges</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>Score Targets:</strong> Reach specific scores for bonus credits</li>
              <li><strong>Streak Challenges:</strong> Play consecutive days for multipliers</li>
              <li><strong>Speed Runs:</strong> Complete levels as fast as possible</li>
              <li><strong>Perfect Games:</strong> Navigate without using shields</li>
            </ul>
            <div className="mt-2 text-xs text-blue-300">
              Rewards: 0.5-2.0 credits per challenge
            </div>
          </div>
          <div className="bg-purple-900/20 border border-purple-600/30 rounded-lg p-4">
            <h4 className="font-semibold text-purple-400 mb-2">🗓️ Weekly Competitions</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>Top Score Contest:</strong> Highest score of the week wins big</li>
              <li><strong>Most Improved:</strong> Biggest improvement over 7 days</li>
              <li><strong>Team Challenges:</strong> Collaborate with friends for group goals</li>
              <li><strong>Marathon Events:</strong> Play the most games in a week</li>
            </ul>
            <div className="mt-2 text-xs text-purple-300">
              Rewards: 5-50 credits + exclusive NFTs
            </div>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-white">Referral & Marketing Rewards</h3>
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="font-semibold text-white mb-3">💰 Earn by Spreading the Word</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="font-medium text-green-400 mb-2">Friend Referrals</h5>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>5 credits when friend joins</li>
                <li>2 credits when they play first game</li>
                <li>10% of their credit purchases (lifetime)</li>
                <li>Bonus rewards when they achieve milestones</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-orange-400 mb-2">Content Creation</h5>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Share gameplay videos: 1-5 credits</li>
                <li>Social media posts: 0.5-2 credits</li>
                <li>Stream POOPEE gameplay: 10-25 credits/hour</li>
                <li>Create memes/fan art: 2-15 credits</li>
              </ul>
            </div>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-white">Social Account Integration</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">🐦 Twitter/X</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Auto-share high scores</li>
              <li>Participate in Twitter challenges</li>
              <li>Retweet for credit rewards</li>
              <li>Tag friends in challenges</li>
            </ul>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">📺 YouTube/TikTok</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Submit gameplay videos</li>
              <li>Tutorial creation rewards</li>
              <li>Reaction video bonuses</li>
              <li>Viral content multipliers</li>
            </ul>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">💬 Discord</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Join official POOPEE server</li>
              <li>Daily activity rewards</li>
              <li>Community event participation</li>
              <li>Beta testing opportunities</li>
            </ul>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-white">Team Features</h3>
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h4 className="font-semibold text-white mb-3">👨‍👩‍👧‍👦 Squad Up for Better Rewards</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="font-medium text-cyan-400 mb-2">Team Formation</h5>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Create or join teams of up to 10 players</li>
                <li>Invite friends via username or social media</li>
                <li>Team-only challenges and competitions</li>
                <li>Shared progress tracking and goals</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-yellow-400 mb-2">Team Rewards</h5>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>10% bonus credits for team members</li>
                <li>Exclusive team-based tournaments</li>
                <li>Collaborative achievement unlocks</li>
                <li>Team leaderboard competitions</li>
              </ul>
            </div>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-white">Future Social Features</h3>
        <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-600/30 rounded-lg p-4">
          <h4 className="font-semibold text-purple-400 mb-3">🚀 Coming Soon</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="font-medium text-white mb-2">Advanced Features</h5>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><strong>Live Tournaments:</strong> Real-time multiplayer competitions</li>
                <li><strong>Clan Wars:</strong> Large-scale team vs team battles</li>
                <li><strong>Seasonal Events:</strong> Limited-time challenges with rare rewards</li>
                <li><strong>User-Generated Content:</strong> Custom levels and challenges</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-white mb-2">Marketing Expansion</h5>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><strong>Influencer Program:</strong> Partner with content creators</li>
                <li><strong>Brand Ambassadors:</strong> Elite player recognition program</li>
                <li><strong>Viral Challenges:</strong> Platform-wide trending challenges</li>
                <li><strong>Cross-Platform Integration:</strong> Connect with other games/apps</li>
              </ul>
            </div>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-white">How to Get Started</h3>
        <div className="space-y-3">
          <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-4">
            <h4 className="font-semibold text-green-400 mb-2">🎯 Quick Start Guide</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li><strong>Link Social Accounts:</strong> Go to Dashboard → Social and connect your accounts</li>
              <li><strong>Join the Community:</strong> Follow official POOPEE accounts and join Discord</li>
              <li><strong>Complete Your First Challenge:</strong> Check daily challenges for easy credits</li>
              <li><strong>Invite Friends:</strong> Share your referral code to start earning</li>
              <li><strong>Create Content:</strong> Share a high score screenshot for instant credits</li>
              <li><strong>Form a Team:</strong> Team up with friends for bonus rewards</li>
            </ol>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-white">Community Guidelines</h3>
        <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-4">
          <h4 className="text-red-400 font-semibold mb-2">📋 Keep it Fun and Fair</h4>
          <ul className="list-disc list-inside space-y-1 text-red-200 text-sm">
            <li><strong>Be Respectful:</strong> Treat all community members with respect</li>
            <li><strong>No Cheating:</strong> Play fair, automated tools will result in account suspension</li>
            <li><strong>Original Content:</strong> Only submit content you created or have rights to use</li>
            <li><strong>Appropriate Content:</strong> Keep posts family-friendly and relevant to POOPEE</li>
            <li><strong>No Spam:</strong> Quality over quantity for content submissions</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
