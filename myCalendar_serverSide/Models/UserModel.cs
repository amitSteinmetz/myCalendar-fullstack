using Microsoft.AspNetCore.Identity;

namespace myCalendar_serverSide.Models
{
    public class UserModel : IdentityUser
    {
        public List<TaskModel> Tasks { get; set; }
    }
}
