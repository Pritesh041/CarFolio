package com.carfolio.marketplace;

import com.carfolio.car.Car;
import com.carfolio.car.CarRepository;
import com.carfolio.car.PhotoStorageService;
import com.carfolio.chat.ChatService;
import com.carfolio.chat.Conversation;
import com.carfolio.chat.ConversationRepository;
import com.carfolio.common.exception.ConflictException;
import com.carfolio.common.exception.NotFoundException;
import com.carfolio.marketplace.dto.ListingPhotoResponse;
import com.carfolio.marketplace.dto.ListingRequest;
import com.carfolio.marketplace.dto.ListingResponse;
import com.carfolio.notification.NotificationService;
import com.carfolio.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class ListingService {

    private final ListingRepository listingRepository;
    private final CarRepository carRepository;
    private final PhotoStorageService photoStorageService;
    private final ConversationRepository conversationRepository;
    private final ChatService chatService;
    private final NotificationService notificationService;

    public ListingService(ListingRepository listingRepository,
                           CarRepository carRepository,
                           PhotoStorageService photoStorageService,
                           ConversationRepository conversationRepository,
                           ChatService chatService,
                           NotificationService notificationService) {
        this.listingRepository = listingRepository;
        this.carRepository = carRepository;
        this.photoStorageService = photoStorageService;
        this.conversationRepository = conversationRepository;
        this.chatService = chatService;
        this.notificationService = notificationService;
    }

    @Transactional(readOnly = true)
    public Page<ListingResponse> browse(ListingFilter filter, Pageable pageable) {
        return listingRepository.findAll(ListingSpecifications.matching(filter), pageable)
                .map(ListingResponse::from);
    }

    @Transactional(readOnly = true)
    public List<ListingResponse> mine(UUID userId) {
        return listingRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(ListingResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public ListingResponse get(UUID id) {
        return ListingResponse.from(findById(id));
    }

    @Transactional
    public ListingResponse create(User user, ListingRequest request) {
        Car car = carRepository.findById(request.carId())
                .orElseThrow(() -> new NotFoundException("CAR_NOT_FOUND", "Car not found"));
        if (!car.getUser().getId().equals(user.getId())) {
            throw new NotFoundException("CAR_NOT_FOUND", "Car not found");
        }

        Listing listing = new Listing();
        listing.setUser(user);
        listing.setCar(car);
        applyRequest(listing, request);
        listing.setStatus(ListingStatus.ACTIVE);
        listing.setPurchasePriceAtListing(car.getPurchasePrice());
        listing = listingRepository.save(listing);

        announceNewListing(user, listing);
        notificationService.notifyNewListing(listing);

        return ListingResponse.from(listing);
    }

    private void announceNewListing(User seller, Listing listing) {
        String content = "I just listed a " + listing.getCar().getModel() + " for ₹" + listing.getPrice()
                + " — check it out!";
        for (Conversation conversation : conversationRepository.findAllForUser(seller.getId())) {
            chatService.sendMessage(conversation, seller, content, true);
        }
    }

    @Transactional
    public ListingResponse update(UUID userId, UUID id, ListingRequest request) {
        Listing listing = findOwned(userId, id);
        boolean priceDropped = request.price().compareTo(listing.getPrice()) < 0;
        applyRequest(listing, request);
        if (priceDropped) {
            notificationService.notifyPriceDrop(listing);
        }
        return ListingResponse.from(listing);
    }

    @Transactional
    public void cancel(UUID userId, UUID id) {
        Listing listing = findOwned(userId, id);
        if (listing.getStatus() == ListingStatus.SOLD) {
            throw new ConflictException("LISTING_ALREADY_SOLD", "A sold listing cannot be cancelled");
        }
        listing.setStatus(ListingStatus.CANCELLED);
    }

    @Transactional
    public ListingResponse markSold(UUID userId, UUID id) {
        Listing listing = findOwned(userId, id);
        if (listing.getStatus() == ListingStatus.SOLD) {
            throw new ConflictException("LISTING_ALREADY_SOLD", "Listing already marked sold");
        }
        listing.setStatus(ListingStatus.SOLD);
        listing.setSoldPrice(listing.getPrice());
        listing.setSoldAt(Instant.now());
        return ListingResponse.from(listing);
    }

    @Transactional
    public ListingPhotoResponse addPhoto(UUID userId, UUID id, MultipartFile file) {
        Listing listing = findOwned(userId, id);
        String url = photoStorageService.store(file);

        ListingPhoto photo = new ListingPhoto();
        photo.setListing(listing);
        photo.setUrl(url);
        photo.setPosition(listing.getPhotos().size());
        photo.setPrimary(listing.getPhotos().isEmpty());
        listing.getPhotos().add(photo);
        listingRepository.save(listing);

        return ListingPhotoResponse.from(photo);
    }

    @Transactional
    public void deletePhoto(UUID userId, UUID id, UUID photoId) {
        Listing listing = findOwned(userId, id);
        listing.getPhotos().removeIf(p -> p.getId().equals(photoId));
    }

    Listing findById(UUID id) {
        return listingRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("LISTING_NOT_FOUND", "Listing not found"));
    }

    Listing findOwned(UUID userId, UUID id) {
        Listing listing = findById(id);
        if (!listing.getUser().getId().equals(userId)) {
            throw new NotFoundException("LISTING_NOT_FOUND", "Listing not found");
        }
        return listing;
    }

    private void applyRequest(Listing listing, ListingRequest request) {
        listing.setPrice(request.price());
        listing.setCondition(request.condition());
        listing.setDescription(request.description());
        listing.setShippingInfo(request.shippingInfo());
    }
}
