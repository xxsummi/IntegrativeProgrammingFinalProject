using System.ComponentModel.DataAnnotations;

namespace InventorySystem.Models
{
    public class Product
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public string Sku { get; set; } = string.Empty;

        [Required]
        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; } = string.Empty;

        [Required]
        public decimal Price { get; set; }

        [Required]
        public int Stock { get; set; } = 0;

        public DateTime UpdatedAt { get; set; } = DateTime.Now;
    }
}
