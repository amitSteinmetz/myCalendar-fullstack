namespace myCalendar_serverSide.Models
{
    public class TaskModel
    {
        public int Id { get; set; }
        public DateOnly Date { get; set; }
        public string Value { get; set; }
        public UserModel User { get; set; }
    }
}
