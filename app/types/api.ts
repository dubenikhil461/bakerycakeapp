// ─── Generic wrappers ─────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: true
  data: T
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface PaginatedResponse<T> {
  success: true
  data: T[]
  meta: PaginationMeta
}

// ─── Category ─────────────────────────────────────────────────────────────────
export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
  isActive: boolean
  sortOrder: number
  parentId: string | null
  createdAt: string
  updatedAt: string
}

export interface CategoryTree extends Category {
  children: CategoryTree[]
}

// ─── Cake ─────────────────────────────────────────────────────────────────────
export interface CakeImage {
  id: string
  cakeId: string
  url: string
  altText: string | null
  isPrimary: boolean
  sortOrder: number
}

export interface CakeVariant {
  id: string
  cakeId: string
  variantType: 'size' | 'weight' | 'flavor' | 'tier'
  name: string
  priceModifier: string   // decimal string
  stockQty: number
  sku: string | null
  isActive: boolean
}

export interface Tag {
  id: string
  name: string
  slug: string
}

export interface CakeListItem {
  id: string
  name: string
  slug: string
  basePrice: string       // decimal string
  shortDescription: string | null
  isFeatured: boolean
  avgRating: string
  reviewCount: number
  category: Pick<Category, 'id' | 'name' | 'slug'> | null
  primaryImageUrl: string | null
}

export interface CakeDetail {
  id: string
  name: string
  slug: string
  basePrice: string
  shortDescription: string | null
  description: string | null
  isFeatured: boolean
  isActive: boolean
  avgRating: string
  reviewCount: number
  metaTitle: string | null
  metaDescription: string | null
  category: Pick<Category, 'id' | 'name' | 'slug'> | null
  images: CakeImage[]
  variants: CakeVariant[]
  tags: Tag[]
}

// ─── Cart ─────────────────────────────────────────────────────────────────────
export interface CartItem {
  id: string
  cartId: string
  cakeId: string
  variantId: string | null
  quantity: number
  unitPrice: string       // decimal string snapshot
  customMessage: string | null
  deliveryDate: string | null
  cake: Pick<CakeListItem, 'id' | 'name' | 'slug' | 'primaryImageUrl'> | null
  variant: Pick<CakeVariant, 'id' | 'name' | 'variantType'> | null
}

export interface Cart {
  id: string
  userId: string
  subtotal: string
  items: CartItem[]
}

// ─── Address ──────────────────────────────────────────────────────────────────
export type AddressType = 'home' | 'office' | 'other'

export interface Address {
  id: string
  userId: string
  fullName: string
  phone: string
  line1: string
  line2: string | null
  city: string
  state: string
  pincode: string
  country: string
  addressType: AddressType
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

// ─── Order ────────────────────────────────────────────────────────────────────
export type OrderStatus =
  | 'pending' | 'confirmed' | 'preparing' | 'ready'
  | 'out_for_delivery' | 'delivered' | 'cancelled' | 'refunded'

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

export type PaymentMethod = 'cod' | 'upi' | 'card' | 'netbanking' | 'wallet'

export interface ShippingSnapshot {
  fullName: string
  phone: string
  line1: string
  line2?: string | null
  city: string
  state: string
  pincode: string
  country: string
}

export interface OrderItem {
  id: string
  orderId: string
  cakeId: string | null
  variantId: string | null
  cakeName: string
  variantName: string | null
  imageUrl: string | null
  quantity: number
  unitPrice: string
  customMessage: string | null
}

export interface OrderStatusHistoryEntry {
  id: string
  orderId: string
  status: OrderStatus
  note: string | null
  changedBy: string | null
  createdAt: string
}

export interface Order {
  id: string
  orderNumber: string
  userId: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  paymentMethod: PaymentMethod
  paymentTransactionId: string | null
  shippingAddressId: string | null
  shippingSnapshot: ShippingSnapshot | null
  subtotal: string
  deliveryFee: string
  totalAmount: string
  deliveryDate: string | null
  deliveryTimeSlot: string | null
  customerNote: string | null
  adminNote: string | null
  createdAt: string
  updatedAt: string
  items: OrderItem[]
  statusHistory: OrderStatusHistoryEntry[]
}

export interface OrderListItem {
  id: string
  orderNumber: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  totalAmount: string
  itemCount: number
  createdAt: string
}

export interface RazorpayOrderDetails {
  razorpayOrderId: string
  amount: number
  currency: string
  keyId: string
}

export interface PlaceOrderResult {
  order: Order
  razorpay: RazorpayOrderDetails | null
}

// ─── Review ───────────────────────────────────────────────────────────────────
export interface Review {
  id: string
  userId: string
  cakeId: string
  orderId: string | null
  rating: number
  title: string | null
  body: string | null
  isVerifiedPurchase: boolean
  isApproved: boolean
  adminReply: string | null
  createdAt: string
  updatedAt: string
  user?: { name: string; email: string }
}

// ─── Wishlist ─────────────────────────────────────────────────────────────────
export interface WishlistItem {
  id: string
  userId: string
  cakeId: string
  createdAt: string
  cake: CakeListItem
}

// ─── Upload ───────────────────────────────────────────────────────────────────
export interface Upload {
  id: string
  storageKey: string
  publicUrl: string
  originalFilename: string | null
  mimeType: string
  sizeBytes: number
  uploadedBy: string
  createdAt: string
}

// ─── Admin ────────────────────────────────────────────────────────────────────
export interface AdminUser {
  id: string
  name: string
  email: string
  role: string
  banned: boolean
  banReason: string | null
  banExpires: string | null
  createdAt: string
}
