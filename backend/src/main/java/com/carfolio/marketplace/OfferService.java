package com.carfolio.marketplace;

import com.carfolio.car.Car;
import com.carfolio.car.CarRepository;
import com.carfolio.car.CarValueSnapshot;
import com.carfolio.car.CarValueSnapshotRepository;
import com.carfolio.chat.ChatService;
import com.carfolio.chat.Conversation;
import com.carfolio.collection.CollectionCarRepository;
import com.carfolio.common.exception.ConflictException;
import com.carfolio.common.exception.NotFoundException;
import com.carfolio.marketplace.dto.OfferRequest;
import com.carfolio.marketplace.dto.OfferResponse;
import com.carfolio.marketplace.dto.PurchaseResponse;
import com.carfolio.notification.NotificationService;
import com.carfolio.notification.NotificationType;
import com.carfolio.user.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class OfferService {

    private final OfferRepository offerRepository;
    private final ListingService listingService;
    private final CarRepository carRepository;
    private final CarValueSnapshotRepository carValueSnapshotRepository;
    private final CollectionCarRepository collectionCarRepository;
    private final ChatService chatService;
    private final NotificationService notificationService;

    public OfferService(OfferRepository offerRepository,
                         ListingService listingService,
                         CarRepository carRepository,
                         CarValueSnapshotRepository carValueSnapshotRepository,
                         CollectionCarRepository collectionCarRepository,
                         ChatService chatService,
                         NotificationService notificationService) {
        this.offerRepository = offerRepository;
        this.listingService = listingService;
        this.carRepository = carRepository;
        this.carValueSnapshotRepository = carValueSnapshotRepository;
        this.collectionCarRepository = collectionCarRepository;
        this.chatService = chatService;
        this.notificationService = notificationService;
    }

    @Transactional
    public OfferResponse create(User buyer, UUID listingId, OfferRequest request) {
        Listing listing = listingService.findById(listingId);
        if (listing.getStatus() != ListingStatus.ACTIVE) {
            throw new ConflictException("LISTING_NOT_ACTIVE", "This listing is not accepting offers");
        }

        Offer offer = new Offer();
        offer.setListing(listing);
        offer.setBuyer(buyer);
        offer.setAmount(request.amount());
        offer.setMessage(request.message());
        offer.setStatus(OfferStatus.PENDING);
        offer = offerRepository.save(offer);

        Conversation conversation = chatService.findOrCreateConversation(buyer, listing.getUser());
        chatService.sendMessage(conversation, buyer,
                "Hi! I'm interested in your " + listing.getCar().getModel() + " — I've made an offer of ₹" + request.amount() + ".",
                true);

        notificationService.notify(listing.getUser(), NotificationType.OFFER_RECEIVED,
                "New offer on your " + listing.getCar().getModel(),
                "₹" + request.amount() + " from " + buyer.getName(),
                "/marketplace/sell");

        return OfferResponse.from(offer);
    }

    @Transactional(readOnly = true)
    public List<OfferResponse> listForListing(UUID userId, UUID listingId) {
        Listing listing = listingService.findOwned(userId, listingId);
        return offerRepository.findByListingIdOrderByCreatedAtDesc(listing.getId())
                .stream().map(OfferResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<PurchaseResponse> myPurchases(UUID buyerId) {
        return offerRepository.findByBuyerIdAndStatusOrderByUpdatedAtDesc(buyerId, OfferStatus.ACCEPTED)
                .stream().map(PurchaseResponse::from).toList();
    }

    @Transactional
    public OfferResponse updateStatus(UUID userId, UUID offerId, OfferStatus status) {
        Offer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new NotFoundException("OFFER_NOT_FOUND", "Offer not found"));

        boolean isSeller = offer.getListing().getUser().getId().equals(userId);
        boolean isBuyer = offer.getBuyer().getId().equals(userId);
        if (!isSeller && !isBuyer) {
            throw new NotFoundException("OFFER_NOT_FOUND", "Offer not found");
        }
        if (status == OfferStatus.WITHDRAWN && !isBuyer) {
            throw new ConflictException("OFFER_ACTION_NOT_ALLOWED", "Only the buyer can withdraw an offer");
        }
        if ((status == OfferStatus.ACCEPTED || status == OfferStatus.DECLINED) && !isSeller) {
            throw new ConflictException("OFFER_ACTION_NOT_ALLOWED", "Only the seller can accept or decline an offer");
        }
        if (offer.getStatus() != OfferStatus.PENDING) {
            throw new ConflictException("OFFER_NOT_PENDING", "This offer has already been resolved");
        }

        offer.setStatus(status);
        if (status == OfferStatus.ACCEPTED) {
            acceptOffer(offer);
        }
        if (status == OfferStatus.ACCEPTED || status == OfferStatus.DECLINED) {
            notificationService.notify(offer.getBuyer(), NotificationType.OFFER_UPDATED,
                    status == OfferStatus.ACCEPTED
                            ? "Your offer was accepted!"
                            : "Your offer was declined",
                    offer.getListing().getCar().getModel() + " — ₹" + offer.getAmount(),
                    status == OfferStatus.ACCEPTED ? "/history" : "/marketplace/" + offer.getListing().getId());
        }

        return OfferResponse.from(offer);
    }

    private void acceptOffer(Offer offer) {
        Listing listing = offer.getListing();
        User seller = listing.getUser();
        User buyer = offer.getBuyer();
        Car car = listing.getCar();

        car.setUser(buyer);
        car.setPurchasePrice(offer.getAmount());
        car.setEstimatedValue(offer.getAmount());
        car.setPurchaseDate(LocalDate.now());
        carRepository.save(car);

        CarValueSnapshot snapshot = new CarValueSnapshot();
        snapshot.setCar(car);
        snapshot.setValue(car.getEstimatedValue());
        carValueSnapshotRepository.save(snapshot);

        collectionCarRepository.deleteByCarId(car.getId());

        for (Offer other : offerRepository.findByListingIdOrderByCreatedAtDesc(listing.getId())) {
            if (!other.getId().equals(offer.getId()) && other.getStatus() == OfferStatus.PENDING) {
                other.setStatus(OfferStatus.DECLINED);
            }
        }

        listing.setStatus(ListingStatus.SOLD);
        listing.setSoldPrice(offer.getAmount());
        listing.setSoldAt(Instant.now());

        Conversation conversation = chatService.findOrCreateConversation(buyer, seller);
        chatService.sendMessage(conversation, seller,
                "Great news — I've accepted your offer for the " + car.getModel() + ". Let's arrange the handover!",
                true);
    }
}
