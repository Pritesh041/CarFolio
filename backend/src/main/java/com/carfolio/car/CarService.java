package com.carfolio.car;

import com.carfolio.brand.Brand;
import com.carfolio.brand.BrandRepository;
import com.carfolio.car.dto.CarPhotoResponse;
import com.carfolio.car.dto.CarRequest;
import com.carfolio.car.dto.CarResponse;
import com.carfolio.car.dto.PhotoUpdateRequest;
import com.carfolio.common.exception.NotFoundException;
import com.carfolio.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.UUID;

@Service
public class CarService {

    private final CarRepository carRepository;
    private final BrandRepository brandRepository;
    private final CarValueSnapshotRepository snapshotRepository;
    private final PhotoStorageService photoStorageService;

    public CarService(CarRepository carRepository,
                       BrandRepository brandRepository,
                       CarValueSnapshotRepository snapshotRepository,
                       PhotoStorageService photoStorageService) {
        this.carRepository = carRepository;
        this.brandRepository = brandRepository;
        this.snapshotRepository = snapshotRepository;
        this.photoStorageService = photoStorageService;
    }

    @Transactional(readOnly = true)
    public Page<CarResponse> list(UUID userId, CarFilter filter, Pageable pageable) {
        return carRepository.findAll(CarSpecifications.matching(userId, filter), pageable)
                .map(CarResponse::from);
    }

    @Transactional(readOnly = true)
    public CarResponse get(UUID userId, UUID carId) {
        return CarResponse.from(findOwned(userId, carId));
    }

    @Transactional
    public CarResponse create(User user, CarRequest request) {
        Brand brand = brandRepository.findById(request.brandId())
                .orElseThrow(() -> new NotFoundException("BRAND_NOT_FOUND", "Brand not found"));

        Car car = new Car();
        car.setUser(user);
        car.setBrand(brand);
        applyRequest(car, request);
        car = carRepository.save(car);

        recordSnapshot(car);

        return CarResponse.from(car);
    }

    @Transactional
    public CarResponse update(UUID userId, UUID carId, CarRequest request) {
        Car car = findOwned(userId, carId);
        BigDecimal previousValue = car.getEstimatedValue();

        if (!car.getBrand().getId().equals(request.brandId())) {
            Brand brand = brandRepository.findById(request.brandId())
                    .orElseThrow(() -> new NotFoundException("BRAND_NOT_FOUND", "Brand not found"));
            car.setBrand(brand);
        }
        applyRequest(car, request);

        if (previousValue.compareTo(car.getEstimatedValue()) != 0) {
            recordSnapshot(car);
        }

        return CarResponse.from(car);
    }

    @Transactional
    public void delete(UUID userId, UUID carId) {
        carRepository.delete(findOwned(userId, carId));
    }

    @Transactional
    public CarResponse duplicate(UUID userId, UUID carId) {
        Car source = findOwned(userId, carId);

        Car copy = new Car();
        copy.setUser(source.getUser());
        copy.setBrand(source.getBrand());
        copy.setModel(source.getModel());
        copy.setVariant(source.getVariant());
        copy.setSeries(source.getSeries());
        copy.setYear(source.getYear());
        copy.setScale(source.getScale());
        copy.setColor(source.getColor());
        copy.setCondition(source.getCondition());
        copy.setPackagingCondition(source.getPackagingCondition());
        copy.setHotWheelsSeriesType(source.getHotWheelsSeriesType());
        copy.setHuntType(source.getHuntType());
        copy.setPurchasePrice(source.getPurchasePrice());
        copy.setPurchaseDate(source.getPurchaseDate());
        copy.setEstimatedValue(source.getEstimatedValue());
        copy.setQuantity(source.getQuantity());
        copy.setNotes(source.getNotes());
        copy = carRepository.save(copy);

        recordSnapshot(copy);

        return CarResponse.from(copy);
    }

    @Transactional
    public CarPhotoResponse addPhoto(UUID userId, UUID carId, MultipartFile file) {
        Car car = findOwned(userId, carId);
        String url = photoStorageService.store(file);

        CarPhoto photo = new CarPhoto();
        photo.setCar(car);
        photo.setUrl(url);
        photo.setPosition(car.getPhotos().size());
        photo.setPrimary(car.getPhotos().isEmpty());
        car.getPhotos().add(photo);
        carRepository.save(car);

        return CarPhotoResponse.from(photo);
    }

    @Transactional
    public CarPhotoResponse updatePhoto(UUID userId, UUID carId, UUID photoId, PhotoUpdateRequest request) {
        Car car = findOwned(userId, carId);
        CarPhoto photo = car.getPhotos().stream()
                .filter(p -> p.getId().equals(photoId))
                .findFirst()
                .orElseThrow(() -> new NotFoundException("PHOTO_NOT_FOUND", "Photo not found"));

        if (request.position() != null) {
            photo.setPosition(request.position());
        }
        if (Boolean.TRUE.equals(request.isPrimary())) {
            car.getPhotos().forEach(p -> p.setPrimary(false));
            photo.setPrimary(true);
        }

        return CarPhotoResponse.from(photo);
    }

    @Transactional
    public void deletePhoto(UUID userId, UUID carId, UUID photoId) {
        Car car = findOwned(userId, carId);
        car.getPhotos().removeIf(p -> p.getId().equals(photoId));
    }

    Car findOwned(UUID userId, UUID carId) {
        Car car = carRepository.findById(carId)
                .orElseThrow(() -> new NotFoundException("CAR_NOT_FOUND", "Car not found"));
        if (!car.getUser().getId().equals(userId)) {
            throw new NotFoundException("CAR_NOT_FOUND", "Car not found");
        }
        return car;
    }

    private void applyRequest(Car car, CarRequest request) {
        car.setModel(request.model());
        car.setVariant(request.variant());
        car.setSeries(request.series());
        car.setYear(request.year());
        car.setScale(request.scale());
        car.setColor(request.color());
        car.setCondition(request.condition());
        car.setPackagingCondition(request.packagingCondition());
        car.setHotWheelsSeriesType(request.hotWheelsSeriesType());
        car.setHuntType(request.huntType());
        car.setPurchasePrice(request.purchasePrice());
        car.setPurchaseDate(request.purchaseDate());
        car.setEstimatedValue(request.estimatedValue());
        car.setQuantity(request.quantity() != null ? request.quantity() : 1);
        car.setNotes(request.notes());
    }

    private void recordSnapshot(Car car) {
        CarValueSnapshot snapshot = new CarValueSnapshot();
        snapshot.setCar(car);
        snapshot.setValue(car.getEstimatedValue());
        snapshotRepository.save(snapshot);
    }
}
