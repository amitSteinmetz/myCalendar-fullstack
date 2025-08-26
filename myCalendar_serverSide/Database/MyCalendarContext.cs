using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace myCalendar_serverSide.Database
{
    public class MyCalendarContext : IdentityDbContext<IdentityUser>
    {
        public MyCalendarContext(DbContextOptions<MyCalendarContext> options) : base(options) { }
    }
}
