import { Request, Response } from "express";
import prisma from "../../utils/prisma";

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Run all queries in parallel for performance
    const [
      // Order & Revenue Stats
      todayOrders,
      weekOrders,
      monthOrders,
      totalOrders,
      
      // Revenue
      todayRevenue,
      weekRevenue,
      monthRevenue,
      
      // Counts
      totalProducts,
      totalCustomers,
      
      // Recent Orders
      recentOrders,
      
      // Low Stock Products
      lowStockProducts,
    ] = await Promise.all([
      // Today's orders
      prisma.order.count({
        where: { 
          createdAt: { gte: startOfToday },
          paymentStatus: "PAID"
        }
      }),
      // Week orders
      prisma.order.count({
        where: { 
          createdAt: { gte: startOfWeek },
          paymentStatus: "PAID"
        }
      }),
      // Month orders
      prisma.order.count({
        where: { 
          createdAt: { gte: startOfMonth },
          paymentStatus: "PAID"
        }
      }),
      // Total orders
      prisma.order.count({
        where: { paymentStatus: "PAID" }
      }),
      
      // Revenue calculations
      prisma.order.aggregate({
        _sum: { finalAmount: true },
        where: { 
          createdAt: { gte: startOfToday },
          paymentStatus: "PAID"
        }
      }),
      prisma.order.aggregate({
        _sum: { finalAmount: true },
        where: { 
          createdAt: { gte: startOfWeek },
          paymentStatus: "PAID"
        }
      }),
      prisma.order.aggregate({
        _sum: { finalAmount: true },
        where: { 
          createdAt: { gte: startOfMonth },
          paymentStatus: "PAID"
        }
      }),
      
      // Total products
      prisma.product.count(),
      
      // Total customers (non-admin users)
      prisma.user.count({
        where: { role: "USER" }
      }),
      
      // Recent orders
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        where: { paymentStatus: "PAID" },
        select: {
          id: true,
          finalAmount: true,
          status: true,
          createdAt: true,
          user: {
            select: {
              name: true,
              email: true,
            }
          }
        }
      }),
      
      // Low stock products (stock < 10)
      prisma.product.findMany({
        where: { stock: { lt: 10 } },
        take: 5,
        orderBy: { stock: "asc" },
        select: {
          id: true,
          name: true,
          images: {
            take: 1,
            select: { url: true }
          },
          stock: true,
        }
      }),
    ]);

    // Get top products by counting items in paid orders
    // Using raw query for better performance on aggregation
    const topProducts = await prisma.product.findMany({
      take: 5,
      orderBy: { reviews: { _count: "desc" } }, // Order by review count as proxy for popularity
      select: {
        id: true,
        name: true,
        price: true,
        images: {
          take: 1,
          select: { url: true }
        },
        _count: {
          select: { reviews: true }
        }
      }
    });

    return res.json({
      success: true,
      stats: {
        orders: {
          today: todayOrders,
          week: weekOrders,
          month: monthOrders,
          total: totalOrders,
        },
        revenue: {
          today: Number(todayRevenue._sum.finalAmount || 0),
          week: Number(weekRevenue._sum.finalAmount || 0),
          month: Number(monthRevenue._sum.finalAmount || 0),
        },
        totalProducts,
        totalCustomers,
      },
      topProducts: topProducts.map(p => ({
        id: p.id,
        name: p.name,
        price: Number(p.price),
        image: p.images[0]?.url || null,
        reviewCount: p._count.reviews,
      })),
      recentOrders: recentOrders.map(o => ({
        ...o,
        finalAmount: Number(o.finalAmount),
      })),
      lowStockProducts: lowStockProducts.map(p => ({
        id: p.id,
        name: p.name,
        image: p.images[0]?.url || null,
        stock: p.stock,
      })),
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch dashboard stats" });
  }
};
