package com.carfolio.notification;

import com.carfolio.marketplace.Listing;
import com.carfolio.notification.dto.NotificationResponse;
import com.carfolio.user.User;
import com.carfolio.wishlist.WishlistItem;
import com.carfolio.wishlist.WishlistRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final WishlistRepository wishlistRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public NotificationService(NotificationRepository notificationRepository,
                                WishlistRepository wishlistRepository,
                                SimpMessagingTemplate messagingTemplate) {
        this.notificationRepository = notificationRepository;
        this.wishlistRepository = wishlistRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @Transactional
    public void notify(User recipient, NotificationType type, String title, String body, String link) {
        Notification notification = new Notification();
        notification.setUser(recipient);
        notification.setType(type);
        notification.setTitle(title);
        notification.setBody(body);
        notification.setLink(link);
        notification = notificationRepository.save(notification);

        messagingTemplate.convertAndSendToUser(recipient.getId().toString(), "/queue/notifications",
                NotificationResponse.from(notification));
    }

    @Transactional
    public void notifyNewListing(Listing listing) {
        UUID brandId = listing.getCar().getBrand().getId();
        for (WishlistItem item : wishlistRepository.findMatching(listing.getCar().getModel(), brandId, listing.getUser().getId())) {
            if (item.isNotifyOnAvailable()) {
                notify(item.getUser(), NotificationType.WISHLIST_MATCH,
                        "A " + listing.getCar().getModel() + " you're watching is now for sale",
                        "Listed at ₹" + listing.getPrice() + " by " + listing.getUser().getName(),
                        "/marketplace/" + listing.getId());
            }
            checkPriceDrop(listing, item);
        }
    }

    @Transactional
    public void notifyPriceDrop(Listing listing) {
        UUID brandId = listing.getCar().getBrand().getId();
        for (WishlistItem item : wishlistRepository.findMatching(listing.getCar().getModel(), brandId, listing.getUser().getId())) {
            checkPriceDrop(listing, item);
        }
    }

    private void checkPriceDrop(Listing listing, WishlistItem item) {
        if (item.isNotifyOnPriceDrop() && item.getTargetPrice() != null
                && listing.getPrice().compareTo(item.getTargetPrice()) <= 0) {
            notify(item.getUser(), NotificationType.PRICE_DROP,
                    "Price match: " + listing.getCar().getModel(),
                    "Listed at ₹" + listing.getPrice() + " — at or below your target of ₹" + item.getTargetPrice(),
                    "/marketplace/" + listing.getId());
        }
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> listMine(UUID userId) {
        return notificationRepository.findTop50ByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(NotificationResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public long unreadCount(UUID userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    @Transactional
    public void markRead(UUID userId, UUID notificationId) {
        notificationRepository.findById(notificationId)
                .filter(n -> n.getUser().getId().equals(userId))
                .ifPresent(n -> n.setRead(true));
    }

    @Transactional
    public void markAllRead(UUID userId) {
        notificationRepository.markAllRead(userId);
    }
}
