using Microsoft.EntityFrameworkCore;

namespace InventorySystem.DataAccess
{
    public class ProductDbContext : DbContext
    {
        public ProductDbContext(DbContextOptions<ProductDbContext> options)
            : base(options)
        {
        }

        public DbSet<InventorySystem.Models.Product> Products { get; set; }
    }
}
