export type Condition = "MINT" | "NEAR_MINT" | "GOOD" | "FAIR" | "POOR";
export type PackagingCondition = "MOC" | "MIP" | "LOOSE" | "OPENED" | "DAMAGED";
export type Priority = "LOW" | "MEDIUM" | "HIGH";
export type HotWheelsSeriesType = "MAINLINE" | "FANTASY";
export type HuntType = "NORMAL" | "TREASURE_HUNT" | "SUPER_TREASURE_HUNT";

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  country: string | null;
}

export interface CarPhoto {
  id: string;
  url: string;
  position: number;
  isPrimary: boolean;
}

export interface Car {
  id: string;
  brand: Brand;
  model: string;
  variant: string | null;
  series: string | null;
  year: number | null;
  scale: string | null;
  color: string | null;
  condition: Condition;
  packagingCondition: PackagingCondition;
  hotWheelsSeriesType: HotWheelsSeriesType | null;
  huntType: HuntType | null;
  purchasePrice: number;
  purchaseDate: string | null;
  estimatedValue: number;
  quantity: number;
  notes: string | null;
  photos: CarPhoto[];
}

export interface CarRequest {
  brandId: string;
  model: string;
  variant?: string;
  series?: string;
  year?: number;
  scale?: string;
  color?: string;
  condition: Condition;
  packagingCondition: PackagingCondition;
  hotWheelsSeriesType?: HotWheelsSeriesType;
  huntType?: HuntType;
  purchasePrice: number;
  purchaseDate?: string;
  estimatedValue: number;
  quantity?: number;
  notes?: string;
}

export interface Page<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface WishlistItem {
  id: string;
  brand: Brand | null;
  model: string;
  variant: string | null;
  series: string | null;
  scale: string | null;
  year: number | null;
  targetPrice: number | null;
  priority: Priority;
  notifyOnAvailable: boolean;
  notifyOnPriceDrop: boolean;
}

export interface WishlistRequest {
  brandId?: string;
  model: string;
  variant?: string;
  series?: string;
  scale?: string;
  year?: number;
  targetPrice?: number;
  priority?: Priority;
  notifyOnAvailable?: boolean;
  notifyOnPriceDrop?: boolean;
}

export interface AnalyticsSummary {
  totalModels: number;
  collectionValue: number;
  totalInvested: number;
  estimatedGain: number;
  growthPercent: number;
}

export interface ValueHistoryPoint {
  date: string;
  value: number;
}

export interface BreakdownItem {
  label: string;
  count: number;
  percent: number;
}

export interface AcquisitionPoint {
  month: string;
  count: number;
}

export interface UserSummary {
  id: string;
  name: string;
  username: string;
  email: string;
  emailVerified: boolean;
}

export interface PublicCollectionSummary {
  slug: string;
  name: string;
  coverImageUrl: string | null;
}

export interface ProfileResponse {
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  joinedAt: string;
  publicCollections: PublicCollectionSummary[];
  favoriteBrands: string[];
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserSummary;
}

export type ListingStatus = "ACTIVE" | "PENDING" | "SOLD" | "CANCELLED";
export type OfferStatus = "PENDING" | "ACCEPTED" | "DECLINED" | "WITHDRAWN";

export interface CollectionCarRef {
  carId: string;
  position: number;
  car: Car;
}

export interface Collection {
  id: string;
  name: string;
  description: string | null;
  coverImageUrl: string | null;
  isPublic: boolean;
  hidePurchasePrices: boolean;
  showEstimatedValues: boolean;
  shareSlug: string | null;
  cars: CollectionCarRef[];
}

export interface CollectionRequest {
  name: string;
  description?: string;
  coverImageUrl?: string;
  hidePurchasePrices?: boolean;
  showEstimatedValues?: boolean;
}

export interface ShowcaseCar {
  id: string;
  brand: Brand;
  model: string;
  variant: string | null;
  series: string | null;
  year: number | null;
  scale: string | null;
  color: string | null;
  condition: Condition;
  packagingCondition: PackagingCondition;
  purchasePrice: number | null;
  estimatedValue: number | null;
  photos: CarPhoto[];
}

export interface PublicShowcase {
  id: string;
  name: string;
  description: string | null;
  coverImageUrl: string | null;
  owner: { username: string; name: string; avatarUrl: string | null };
  cars: ShowcaseCar[];
}

export interface DiscoverShowcaseSummary {
  username: string;
  slug: string;
  name: string;
  coverImageUrl: string | null;
  ownerName: string;
}

export interface ListingCarSummary {
  id: string;
  brand: Brand;
  model: string;
  variant: string | null;
  series: string | null;
  year: number | null;
  scale: string | null;
  color: string | null;
}

export interface ListingPhoto {
  id: string;
  url: string;
  position: number;
  isPrimary: boolean;
}

export interface Listing {
  id: string;
  sellerId: string;
  sellerUsername: string;
  sellerName: string;
  car: ListingCarSummary;
  price: number;
  condition: Condition;
  description: string | null;
  shippingInfo: string | null;
  status: ListingStatus;
  purchasePriceAtListing: number | null;
  soldPrice: number | null;
  profit: number | null;
  soldAt: string | null;
  createdAt: string;
  photos: ListingPhoto[];
}

export interface ListingRequest {
  carId: string;
  price: number;
  condition: Condition;
  description?: string;
  shippingInfo?: string;
}

export interface Offer {
  id: string;
  listingId: string;
  buyerId: string;
  buyerUsername: string;
  buyerName: string;
  amount: number;
  message: string | null;
  status: OfferStatus;
  createdAt: string;
}

export interface OfferRequest {
  amount: number;
  message?: string;
}

export interface Purchase {
  offerId: string;
  listingId: string;
  car: ListingCarSummary;
  photos: ListingPhoto[];
  amount: number;
  sellerUsername: string;
  sellerName: string;
  purchasedAt: string;
}

export interface DiscoverResponse {
  showcases: DiscoverShowcaseSummary[];
  listings: Listing[];
}

export interface ConversationParticipant {
  id: string;
  username: string;
  name: string;
  avatarUrl: string | null;
}

export interface Conversation {
  id: string;
  otherParticipant: ConversationParticipant;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderUsername: string;
  senderName: string;
  content: string;
  automated: boolean;
  createdAt: string;
}

export interface SendMessageRequest {
  content: string;
}

export interface StartConversationRequest {
  username: string;
}

export type TradeStatus = "PROPOSED" | "ACCEPTED" | "DECLINED" | "CANCELLED" | "COMPLETED";

export interface TradeCarSummary {
  id: string;
  brand: Brand;
  model: string;
  variant: string | null;
  series: string | null;
  year: number | null;
  scale: string | null;
  color: string | null;
  primaryPhotoUrl: string | null;
}

export interface TradeItem {
  id: string;
  car: TradeCarSummary;
  offeredByUserId: string;
  estimatedValueAtTrade: number;
}

export interface TradeParty {
  id: string;
  username: string;
  name: string;
}

export interface Trade {
  id: string;
  initiator: TradeParty;
  recipient: TradeParty;
  status: TradeStatus;
  items: TradeItem[];
  createdAt: string;
  updatedAt: string;
}

export interface TradeRequest {
  recipientUsername: string;
  requestedCarId: string;
  offeredCarIds: string[];
  message?: string;
}

export type NotificationType =
  | "WISHLIST_MATCH"
  | "PRICE_DROP"
  | "OFFER_RECEIVED"
  | "OFFER_UPDATED"
  | "TRADE_PROPOSED"
  | "TRADE_UPDATED";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface IdentificationResponse {
  found: boolean;
  brandGuess: string | null;
  modelGuess: string | null;
  seriesGuess: string | null;
  scaleGuess: string | null;
  colorGuess: string | null;
  confidence: number | null;
  message: string | null;
}

export interface CommunityFeedResponse {
  showcases: DiscoverShowcaseSummary[];
  listings: Listing[];
  followingCount: number;
}
