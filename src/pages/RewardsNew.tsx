import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock } from 'lucide-react';

// Define types for our components
interface RewardCardProps {
  count: number;
  icon: string;
  name: string;
}

interface LeaderboardMemberProps {
  avatar: string;
  name: string;
  points: number;
}

const RewardsNew: React.FC = () => {
  const navigate = useNavigate();

  // Mock data for the leaderboard
  const leaderboardMembers: LeaderboardMemberProps[] = [
    {
      avatar: 'https://i.pravatar.cc/150?img=1',
      name: 'Arjun Mehra',
      points: 1890,
    },
    {
      avatar: 'https://i.pravatar.cc/150?img=2',
      name: 'Pooja Batra',
      points: 1450,
    },
    {
      avatar: 'https://i.pravatar.cc/150?img=3',
      name: 'Amisha D.',
      points: 1342,
    },
    {
      avatar: 'https://i.pravatar.cc/150?img=4',
      name: 'Vaibhav Gupta',
      points: 1200,
    },
  ];

  return (
    <div className="max-w-md mx-auto bg-[#2a0a50] min-h-screen text-white">
      {/* Header */}
      <div className="p-4">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-purple-900/50"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Today's Deal Section */}
      <div className="px-4 pb-8">
        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-300 to-yellow-200 text-transparent bg-clip-text">TODAY'S DEAL</h1>
          <p className="text-purple-200 text-sm">CLAIM AND EARN</p>
        </div>

        {/* Deal Card */}
        <div className="bg-gradient-to-br from-yellow-200 to-orange-400 rounded-2xl p-4 relative">
          <div className="bg-pink-600 text-white px-2 py-1 rounded-md w-fit text-xs font-bold">
            EAT CLUB
          </div>
          
          <div className="flex justify-between mt-2">
            <div className="max-w-[60%]">
              <h2 className="text-black text-xl font-bold">Claim 20% off on Box8, Pasta & more</h2>
              
              <div className="flex gap-2 items-center mt-4">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-gray-700" />
                  <span className="text-gray-700 text-sm">Ends in: 5h</span>
                </div>
                
                <div className="flex items-center gap-1 ml-2">
                  <div className="w-4 h-4 bg-gray-700 rounded-full"></div>
                  <span className="text-gray-700 text-sm">4K claimed</span>
                </div>
              </div>
              
              <div className="mt-8">
                <button className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg font-medium shadow-lg shadow-pink-600/30">
                  Claim Now
                </button>
              </div>
            </div>
            
            <div className="flex-shrink-0">
              <img 
                src="https://i.imgur.com/nOGOx6Z.png" 
                alt="Food Bowl" 
                className="w-32 h-32 object-contain"
              />
            </div>
          </div>
        </div>

        {/* Carousel dots */}
        <div className="flex justify-center gap-1 mt-4">
          <div className="w-2 h-2 bg-white rounded-full"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
        </div>
      </div>

      {/* Milestone Challenges Section */}
      <div className="bg-[#4c1d8b] p-4 rounded-t-3xl">
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold text-white">MILESTONE</h2>
          <p className="text-purple-200 text-sm">Challenges</p>
          <p className="text-purple-200 text-xs mt-1">UNLOCK CHALLENGES TO EARN REWARDS</p>
        </div>

        {/* Rewards Cards */}
        <div className="flex gap-4 justify-center">
          <RewardCard count={6} icon="https://i.imgur.com/RZA62Dv.png" name="Headphones" />
          <RewardCard count={8} icon="https://i.imgur.com/UtR7EKl.png" name="Apple Watch" />
        </div>

        <div className="flex items-center justify-center mt-4 text-xs text-purple-200">
          <div className="w-3 h-3 bg-pink-600 rounded-full mr-2"></div>
          New reward cards in 4hrs
        </div>
      </div>

      {/* Headphone Challenge Section */}
      <div className="bg-gradient-to-b from-[#0c0121] to-[#25104b] p-4">
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold text-white">Headphones Challenge</h2>
          
          <div className="flex justify-center gap-4 mt-2 text-sm">
            <div className="flex items-center">
              <Clock className="w-4 h-4 text-pink-400 mr-1" />
              <span className="text-pink-200">Ends in 4hrs</span>
            </div>
            <div className="flex items-center">
              <span className="text-pink-200">2.4K Members Joined</span>
            </div>
          </div>
        </div>

        {/* Headphone Image */}
        <div className="flex justify-center mb-6">
          <div className="relative w-60 h-60">
            <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <img 
                src="https://i.imgur.com/RZA62Dv.png" 
                alt="Headphones" 
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="mb-4">
          <h3 className="uppercase text-center text-gray-400 mb-4">Members in lead</h3>
          
          <div className="grid grid-cols-4 gap-2">
            {leaderboardMembers.map((member, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="relative mb-1">
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-purple-500">
                    <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center text-[10px]">
                    {index + 1}
                  </div>
                </div>
                <p className="text-xs text-center text-white whitespace-nowrap overflow-hidden text-ellipsis w-full">
                  {member.name}
                </p>
                <p className="text-[10px] text-purple-300">{member.points} pts</p>
                <button className="mt-2 text-[10px] px-3 py-1 bg-pink-600 rounded-md text-white">
                  Vote Now
                </button>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-4">
            <button className="text-sm text-purple-300">
              See all members
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Reward Card Component
const RewardCard: React.FC<RewardCardProps> = ({ count, icon, name }) => {
  return (
    <div className="bg-[#12052e] rounded-xl p-4 w-36 flex flex-col items-center">
      <div className="relative w-24 h-24 mb-2">
        <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-lg"></div>
        <img src={icon} alt={name} className="relative z-10 w-full h-full object-contain" />
      </div>
      <p className="text-white text-sm">{name}</p>
      <div className="flex items-center mt-2">
        <span className="text-sm font-bold">x{count}</span>
        <div className="w-4 h-4 bg-blue-400 rounded-full ml-1"></div>
      </div>
    </div>
  );
};

export default RewardsNew; 