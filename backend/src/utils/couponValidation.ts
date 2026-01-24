import prisma from "./prisma";

export class CouponValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CouponValidationError";
  }
}

interface CouponValidationContext {
  orderValue?: number;
  productIds?: string[];
  userId?: string;
}

type CouponWithProducts = NonNullable<
  Awaited<ReturnType<typeof prisma.coupon.findUnique>>
> & {
  applicableProducts: { id: string }[];
};

interface CouponValidationResult {
  coupon: CouponWithProducts;
  discountAmount: number;
  finalAmount: number;
}

const toNumber = (value: any) => {
  if (value === null || value === undefined) return 0;
  return Number(value) || 0;
};

export const validateCouponAndCalculateDiscount = async (
  code: string,
  context: CouponValidationContext = {}
): Promise<CouponValidationResult> => {
  const couponRecord = await prisma.coupon.findUnique({
    where: { code },
    include: {
      applicableProducts: {
        select: { id: true },
      },
    },
  });

  if (!couponRecord) {
    throw new CouponValidationError("Coupon not found");
  }

  const coupon = couponRecord as CouponWithProducts;

  const now = new Date();
  if (!coupon.isActive) {
    throw new CouponValidationError("Coupon is inactive");
  }

  if (coupon.validFrom && coupon.validFrom > now) {
    throw new CouponValidationError("Coupon is not yet valid");
  }

  if (coupon.validTo && coupon.validTo < now) {
    throw new CouponValidationError("Coupon has expired");
  }

  const orderValue = toNumber(context.orderValue);
  if (coupon.minOrderValue && orderValue < Number(coupon.minOrderValue)) {
    throw new CouponValidationError(
      `Minimum order value of ₹${Number(coupon.minOrderValue)} not met`
    );
  }

  if (!coupon.isForAllProducts) {
    const productIds = context.productIds || [];
    if (!productIds.length) {
      throw new CouponValidationError(
        "Coupon not applicable to selected items"
      );
    }

    const applicableProductIds = coupon.applicableProducts.map(
      (p: { id: string }) => p.id
    );
    const hasEligibleProduct = productIds.some((id) =>
      applicableProductIds.includes(id)
    );

    if (!hasEligibleProduct) {
      throw new CouponValidationError(
        "Coupon not applicable to selected items"
      );
    }
  }

  if (coupon.usageLimit) {
    const totalRedemptions = await prisma.redeemedCoupon.count({
      where: { couponId: coupon.id },
    });
    if (totalRedemptions >= coupon.usageLimit) {
      throw new CouponValidationError("Coupon usage limit reached");
    }
  }

  if (coupon.perUserLimit && context.userId) {
    const userUsage = await prisma.redeemedCoupon.count({
      where: { couponId: coupon.id, userId: context.userId },
    });
    if (userUsage >= coupon.perUserLimit) {
      throw new CouponValidationError("You have already used this coupon");
    }
  }

  const discountValue = toNumber(coupon.discountValue ?? coupon.discount);
  let discountAmount = 0;

  if (coupon.discountType === "PERCENTAGE") {
    discountAmount = (orderValue * discountValue) / 100;
    
    // Apply maximum discount cap if defined (prevents huge percentage discounts on large orders)
    const maxDiscount = toNumber((coupon as any).maxDiscount);
    if (maxDiscount > 0 && discountAmount > maxDiscount) {
      discountAmount = maxDiscount;
    }
  } else {
    discountAmount = discountValue;
  }

  if (!orderValue) {
    discountAmount = discountAmount || discountValue;
  }

  discountAmount = Math.min(discountAmount, orderValue || discountAmount);
  const finalAmount = Math.max((orderValue || 0) - discountAmount, 0);

  return {
    coupon,
    discountAmount,
    finalAmount,
  };
};
