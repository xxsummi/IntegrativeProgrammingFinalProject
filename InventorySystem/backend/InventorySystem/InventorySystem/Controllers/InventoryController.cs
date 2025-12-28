using InventorySystem.DataAccess;
using InventorySystem.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;
using System.Text;
using System.Text.Json;

namespace InventorySystem.Controllers
{
    [ApiController]
    [Route("api/products")]
    public class InventoryController : ControllerBase
    {
        private readonly ProductDbContext _context;
        private readonly IHubContext<InventoryHub> _hubContext;
        private readonly HttpClient _httpClient;

        public InventoryController(ProductDbContext context, IHubContext<InventoryHub> hubContext, HttpClient httpClient)
        {
            _context = context;
            _hubContext = hubContext;
            _httpClient = httpClient;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllProducts(string search = "", int page = 1, int pageSize = 10)
        {
            var query = _context.Products.AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(a => a.Name.Contains(search));
            }

            var totalItems = await query.CountAsync();

            var products = await query
                .OrderBy(p => p.Name)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return Ok(new
            {
                TotalItems = totalItems,
                Products = products
            });
        }

        [HttpGet("{id:Guid}")]
        public async Task<IActionResult> GetProduct(Guid id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return NotFound();
            return Ok(product);
        }

        [HttpPost]
        public async Task<IActionResult> CreateProduct([FromBody] Product product)
        {
            if (!ModelState.IsValid || (await _context.Products.AnyAsync(p => p.Sku == product.Sku)))
            {
                return BadRequest(ModelState);
            }

            Console.WriteLine("Name: " + product.Name);
            Console.WriteLine("Description: " + product.Description);
            Console.WriteLine("Price: " + product.Price);
            Console.WriteLine("Stock: " + product.Stock);
            Console.WriteLine("SKU: " + product.Sku);

            product.Id = Guid.NewGuid();
            product.UpdatedAt = DateTime.UtcNow;
            _context.Products.Add(product);
            await _context.SaveChangesAsync();
            
            await _hubContext.Clients.Group("InventoryUsers").SendAsync("ProductAdded", product);
            
            // Notify sales system via WebSocket
            await NotifySalesSystem("product-added", new { product });
            
            return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, product);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProduct(Guid id, [FromBody] Product product)
        {
            if (id != product.Id) return BadRequest();
            if (!ModelState.IsValid || (await _context.Products.AnyAsync(p => p.Sku == product.Sku && p.Id != id)))
            {
                return BadRequest(ModelState);
            }
            var existingProduct = await _context.Products.FindAsync(id);
            if (existingProduct == null) return NotFound();

            existingProduct.Name = product.Name;
            existingProduct.Description = product.Description;
            existingProduct.Price = product.Price;
            existingProduct.Stock = product.Stock;
            existingProduct.Sku = product.Sku;
            existingProduct.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            
            await _hubContext.Clients.Group("InventoryUsers").SendAsync("StockUpdated", new { sku = existingProduct.Sku, stock = existingProduct.Stock });
            
            // Notify sales system via WebSocket
            await NotifySalesSystem("product-updated", new { product = existingProduct });
            
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(Guid id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return NotFound();
            _context.Products.Remove(product);
            await _context.SaveChangesAsync();
            
            await _hubContext.Clients.Group("InventoryUsers").SendAsync("ProductDeleted", id);
            
            // Notify sales system via WebSocket
            await NotifySalesSystem("product-deleted", new { productId = id });
            
            return NoContent();
        }

        [HttpPost("addstock/{id}")]
        public async Task<IActionResult> AddStock(Guid id, [FromBody] AddStockRequest request)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return NotFound();
            
            product.Stock += request.Amount;
            product.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            
            await _hubContext.Clients.Group("InventoryUsers").SendAsync("StockUpdated", new { sku = product.Sku, stock = product.Stock });
            
            // Notify sales system via WebSocket
            await NotifySalesSystem("product-updated", new { product });
            
            return Ok(new { stock = product.Stock });
        }

        [HttpGet("{sku}")]
        public async Task<IActionResult> GetProductBySku(string sku)
        {
            var product = await _context.Products.FirstOrDefaultAsync(p => p.Sku == sku);
            if (product == null) return NotFound();
            return Ok(product);
        }

        private async Task NotifySalesSystem(string endpoint, object data)
        {
            try
            {
                var json = JsonSerializer.Serialize(data);
                var content = new StringContent(json, Encoding.UTF8, "application/json");
                await _httpClient.PostAsync($"http://localhost:8082/notify/{endpoint}", content);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to notify sales system: {ex.Message}");
            }
        }
    }

    public class AddStockRequest
    {
        public int Amount { get; set; }
    }

    [ApiController]
    [Route("api/notify")]
    public class NotificationController : ControllerBase
    {
        private readonly IHubContext<InventoryHub> _hubContext;

        public NotificationController(IHubContext<InventoryHub> hubContext)
        {
            _hubContext = hubContext;
        }

        [HttpPost("stock-update")]
        public async Task<IActionResult> NotifyStockUpdate([FromBody] StockUpdateNotification notification)
        {
            await _hubContext.Clients.Group("InventoryUsers").SendAsync("StockUpdated", new { sku = notification.Sku, stock = notification.Stock });
            return Ok();
        }
    }

    public class StockUpdateNotification
    {
        public string Sku { get; set; } = string.Empty;
        public int Stock { get; set; }
    }
}
