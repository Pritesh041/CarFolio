package com.carfolio.collection;

import com.carfolio.car.Car;
import com.carfolio.car.CarRepository;
import com.carfolio.collection.dto.CollectionRequest;
import com.carfolio.collection.dto.CollectionResponse;
import com.carfolio.collection.dto.DiscoverResponse;
import com.carfolio.collection.dto.PublicShowcaseResponse;
import com.carfolio.common.exception.NotFoundException;
import com.carfolio.marketplace.ListingRepository;
import com.carfolio.marketplace.ListingStatus;
import com.carfolio.marketplace.dto.ListingResponse;
import com.carfolio.user.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
public class CollectionService {

    private final CollectionRepository collectionRepository;
    private final CarRepository carRepository;
    private final ListingRepository listingRepository;

    public CollectionService(CollectionRepository collectionRepository,
                              CarRepository carRepository,
                              ListingRepository listingRepository) {
        this.collectionRepository = collectionRepository;
        this.carRepository = carRepository;
        this.listingRepository = listingRepository;
    }

    @Transactional(readOnly = true)
    public List<CollectionResponse> list(UUID userId) {
        return collectionRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(CollectionResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public CollectionResponse get(UUID userId, UUID id) {
        return CollectionResponse.from(findOwned(userId, id));
    }

    @Transactional
    public CollectionResponse create(User user, CollectionRequest request) {
        Collection collection = new Collection();
        collection.setUser(user);
        applyRequest(collection, request);
        collection = collectionRepository.save(collection);
        return CollectionResponse.from(collection);
    }

    @Transactional
    public CollectionResponse update(UUID userId, UUID id, CollectionRequest request) {
        Collection collection = findOwned(userId, id);
        applyRequest(collection, request);
        return CollectionResponse.from(collection);
    }

    @Transactional
    public void delete(UUID userId, UUID id) {
        collectionRepository.delete(findOwned(userId, id));
    }

    @Transactional
    public CollectionResponse addCars(UUID userId, UUID collectionId, List<UUID> carIds) {
        Collection collection = findOwned(userId, collectionId);
        int nextPosition = collection.getCars().size();

        for (UUID carId : carIds) {
            boolean alreadyIn = collection.getCars().stream()
                    .anyMatch(cc -> cc.getCar().getId().equals(carId));
            if (alreadyIn) {
                continue;
            }
            Car car = carRepository.findById(carId)
                    .orElseThrow(() -> new NotFoundException("CAR_NOT_FOUND", "Car not found"));
            if (!car.getUser().getId().equals(userId)) {
                throw new NotFoundException("CAR_NOT_FOUND", "Car not found");
            }

            CollectionCar collectionCar = new CollectionCar();
            collectionCar.setCollection(collection);
            collectionCar.setCar(car);
            collectionCar.setPosition(nextPosition++);
            collection.getCars().add(collectionCar);
        }

        collectionRepository.save(collection);
        return CollectionResponse.from(collection);
    }

    @Transactional
    public CollectionResponse removeCar(UUID userId, UUID collectionId, UUID carId) {
        Collection collection = findOwned(userId, collectionId);
        collection.getCars().removeIf(cc -> cc.getCar().getId().equals(carId));
        return CollectionResponse.from(collection);
    }

    @Transactional
    public CollectionResponse reorder(UUID userId, UUID collectionId, List<UUID> orderedCarIds) {
        Collection collection = findOwned(userId, collectionId);

        for (int i = 0; i < orderedCarIds.size(); i++) {
            UUID carId = orderedCarIds.get(i);
            int position = i;
            CollectionCar collectionCar = collection.getCars().stream()
                    .filter(cc -> cc.getCar().getId().equals(carId))
                    .findFirst()
                    .orElseThrow(() -> new NotFoundException("CAR_NOT_IN_COLLECTION", "Car is not in this collection"));
            collectionCar.setPosition(position);
        }
        collection.getCars().sort(Comparator.comparingInt(CollectionCar::getPosition));

        return CollectionResponse.from(collection);
    }

    @Transactional
    public CollectionResponse publish(UUID userId, UUID collectionId) {
        Collection collection = findOwned(userId, collectionId);
        if (collection.getShareSlug() == null) {
            collection.setShareSlug(generateSlug(collection.getName()));
        }
        collection.setPublished(true);
        return CollectionResponse.from(collection);
    }

    @Transactional
    public CollectionResponse unpublish(UUID userId, UUID collectionId) {
        Collection collection = findOwned(userId, collectionId);
        collection.setPublished(false);
        return CollectionResponse.from(collection);
    }

    @Transactional(readOnly = true)
    public PublicShowcaseResponse getPublicShowcase(String username, String slug) {
        Collection collection = collectionRepository.findByShareSlugAndUserUsername(slug, username)
                .filter(Collection::isPublished)
                .orElseThrow(() -> new NotFoundException("SHOWCASE_NOT_FOUND", "Showcase not found"));
        return PublicShowcaseResponse.from(collection);
    }

    @Transactional(readOnly = true)
    public DiscoverResponse discover() {
        List<DiscoverResponse.ShowcaseSummary> showcases = collectionRepository.findTop12ByPublishedTrueOrderByUpdatedAtDesc()
                .stream().map(DiscoverResponse.ShowcaseSummary::from).toList();
        List<ListingResponse> listings = listingRepository.findTop12ByStatusOrderByCreatedAtDesc(ListingStatus.ACTIVE)
                .stream().map(ListingResponse::from).toList();
        return new DiscoverResponse(showcases, listings);
    }

    private Collection findOwned(UUID userId, UUID id) {
        Collection collection = collectionRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("COLLECTION_NOT_FOUND", "Collection not found"));
        if (!collection.getUser().getId().equals(userId)) {
            throw new NotFoundException("COLLECTION_NOT_FOUND", "Collection not found");
        }
        return collection;
    }

    private void applyRequest(Collection collection, CollectionRequest request) {
        collection.setName(request.name());
        collection.setDescription(request.description());
        collection.setCoverImageUrl(request.coverImageUrl());
        if (request.hidePurchasePrices() != null) {
            collection.setHidePurchasePrices(request.hidePurchasePrices());
        }
        if (request.showEstimatedValues() != null) {
            collection.setShowEstimatedValues(request.showEstimatedValues());
        }
    }

    private String generateSlug(String name) {
        String base = name.toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("(^-|-$)", "");
        if (base.isBlank()) {
            base = "showcase";
        }
        String slug;
        do {
            slug = base + "-" + UUID.randomUUID().toString().substring(0, 6);
        } while (collectionRepository.existsByShareSlug(slug));
        return slug;
    }
}
