using Microsoft.AspNetCore.SignalR;

namespace InventorySystem
{
    public class InventoryHub : Hub
    {
        public async Task JoinInventoryGroup()
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, "InventoryUsers");
        }

        public async Task NotifyStockUpdate(string sku, int newStock)
        {
            await Clients.Group("InventoryUsers").SendAsync("StockUpdated", new { sku, stock = newStock });
        }

        public async Task NotifyProductAdded(object product)
        {
            await Clients.Group("InventoryUsers").SendAsync("ProductAdded", product);
        }

        public async Task NotifyProductDeleted(int productId)
        {
            await Clients.Group("InventoryUsers").SendAsync("ProductDeleted", productId);
        }
    }
}