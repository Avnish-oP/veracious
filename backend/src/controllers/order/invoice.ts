import { Request, Response } from "express";
import prisma from "../../utils/prisma";
import { generateInvoicePDF, GST_RATES } from "../../utils/invoiceGenerator";

export const downloadInvoice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Fetch order with all needed details
    const order = await prisma.order.findFirst({
      where: {
        id,
        userId,
        paymentStatus: "PAID", // Only allow invoices for paid orders
      },
      select: {
        id: true,
        items: true,
        totalAmount: true,
        discount: true,
        finalAmount: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        address: {
          select: {
            line1: true,
            line2: true,
            city: true,
            state: true,
            postal: true,
            country: true,
          },
        },
        coupon: {
          select: {
            code: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found or not eligible for invoice",
      });
    }

    if (!order.address) {
      return res.status(400).json({
        success: false,
        message: "Order has no address attached",
      });
    }

    // Parse items and determine GST rates
    const items = (order.items as any[]).map((item) => {
      // Determine GST rate based on item configuration or default
      let gstRate = GST_RATES.DEFAULT;
      
      // If item has lens configuration, it's corrective eyewear (5%)
      if (item.configuration?.lensType) {
        gstRate = GST_RATES.CORRECTIVE_LENS;
      }
      // You could add more logic here based on categories

      return {
        name: item.name || "Product",
        quantity: item.quantity || 1,
        price: Number(item.price || item.priceAtPurchase || 0),
        gstRate,
      };
    });

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discount = Number(order.discount) || 0;
    const finalAmount = Number(order.finalAmount) || 0;
    const shipping = finalAmount - (subtotal - discount); // Derive shipping from final amount

    // Generate PDF
    const pdfBuffer = await generateInvoicePDF({
      orderId: order.id,
      orderDate: order.createdAt,
      customerName: order.user?.name || "Customer",
      customerEmail: order.user?.email || "",
      address: order.address,
      items,
      subtotal,
      discount,
      shipping: Math.max(0, shipping), // Ensure non-negative
      finalAmount,
      couponCode: order.coupon?.code,
    });

    // Set response headers for PDF download
    const filename = `Invoice_${order.id.slice(-8).toUpperCase()}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", pdfBuffer.length);

    return res.send(pdfBuffer);
  } catch (error) {
    console.error("Generate invoice error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate invoice",
    });
  }
};
// Admin: Download any invoice
export const downloadAdminInvoice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Fetch order without userId constraint
    const order = await prisma.order.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        items: true,
        totalAmount: true,
        discount: true,
        finalAmount: true,
        createdAt: true,
        paymentStatus: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        address: {
          select: {
            line1: true,
            line2: true,
            city: true,
            state: true,
            postal: true,
            country: true,
          },
        },
        coupon: {
          select: {
            code: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.paymentStatus !== "PAID") {
        return res.status(400).json({
            success: false,
            message: "Invoice available only for paid orders", 
        });
    }

    if (!order.address) {
      return res.status(400).json({
        success: false,
        message: "Order has no address attached",
      });
    }

    // Parse items and determine GST rates
    const items = (order.items as any[]).map((item) => {
      let gstRate = GST_RATES.DEFAULT;
      if (item.configuration?.lensType) {
        gstRate = GST_RATES.CORRECTIVE_LENS;
      }
      return {
        name: item.name || "Product",
        quantity: item.quantity || 1,
        price: Number(item.price || item.priceAtPurchase || 0),
        gstRate,
      };
    });

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discount = Number(order.discount) || 0;
    const finalAmount = Number(order.finalAmount) || 0;
    const shipping = finalAmount - (subtotal - discount);

    const pdfBuffer = await generateInvoicePDF({
      orderId: order.id,
      orderDate: order.createdAt,
      customerName: order.user?.name || "Customer",
      customerEmail: order.user?.email || "",
      address: order.address,
      items,
      subtotal,
      discount,
      shipping: Math.max(0, shipping),
      finalAmount,
      couponCode: order.coupon?.code,
    });

    const filename = `Invoice_${order.id.slice(-8).toUpperCase()}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", pdfBuffer.length);

    return res.send(pdfBuffer);
  } catch (error) {
    console.error("Generate admin invoice error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate invoice",
    });
  }
};
