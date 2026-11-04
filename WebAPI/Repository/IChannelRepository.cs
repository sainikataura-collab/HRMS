//namespace HRMSWebAPI.Repository
//{
//    public interface IChannelRepository
//    {
//    }
//}

using HRMSWebAPI.Models;

namespace HRMSWebAPI.Repository
{
    public interface IChannelRepository
    {
        Task<bool> InsertChannelMstAsync(ChannelMst channelMst);
        Task<IEnumerable<ChannelMst>> GetAll();
        Task<ChannelMst> GetChannelByIdAsync(string channelId);
        Task<bool> UpdateChannelMstAsync(ChannelMst channelMst);
        Task<bool> DeleteChannelMstAsync(string channelId);
    }
}