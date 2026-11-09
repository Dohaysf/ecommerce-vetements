export const ORDER_STATUSES = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

export type OrderStatusValue = (typeof ORDER_STATUSES)[number];

export const STATUS_LABELS: Record<OrderStatusValue, string> = {
  PENDING: "En attente",
  PAID: "Payée",
  PROCESSING: "En préparation",
  SHIPPED: "Expédiée",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
};

export const STATUS_STYLES: Record<OrderStatusValue, string> = {
  PENDING: "bg-[#F6E7C8] text-[#8A6A1F]",
  PAID: "bg-[#D5ECEA] text-[#2F6F6A]",
  PROCESSING: "bg-[#DDE6F3] text-[#3C5A8A]",
  SHIPPED: "bg-[#E6DDF3] text-[#5B4690]",
  DELIVERED: "bg-[#C9E4CF] text-[#256B3A]",
  CANCELLED: "bg-[#F3D9D9] text-[#9B3B3B]",
};