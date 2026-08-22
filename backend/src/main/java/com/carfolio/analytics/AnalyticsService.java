package com.carfolio.analytics;

import com.carfolio.analytics.dto.AcquisitionPoint;
import com.carfolio.analytics.dto.BreakdownItem;
import com.carfolio.analytics.dto.SummaryResponse;
import com.carfolio.analytics.dto.ValueHistoryPoint;
import com.carfolio.car.Car;
import com.carfolio.car.CarRepository;
import com.carfolio.car.CarValueSnapshotRepository;
import com.carfolio.car.dto.CarResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private final CarRepository carRepository;
    private final CarValueSnapshotRepository snapshotRepository;

    public AnalyticsService(CarRepository carRepository, CarValueSnapshotRepository snapshotRepository) {
        this.carRepository = carRepository;
        this.snapshotRepository = snapshotRepository;
    }

    @Transactional(readOnly = true)
    public SummaryResponse summary(UUID userId) {
        List<Car> cars = carRepository.findByUserId(userId);

        long totalModels = cars.stream().mapToLong(Car::getQuantity).sum();
        BigDecimal invested = sum(cars, Car::getPurchasePrice);
        BigDecimal value = sum(cars, Car::getEstimatedValue);
        BigDecimal gain = value.subtract(invested);
        BigDecimal growthPercent = invested.compareTo(BigDecimal.ZERO) == 0
                ? BigDecimal.ZERO
                : gain.divide(invested, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100));

        return new SummaryResponse(totalModels, value, invested, gain, growthPercent.setScale(1, RoundingMode.HALF_UP));
    }

    @Transactional(readOnly = true)
    public List<ValueHistoryPoint> valueHistory(UUID userId, String range) {
        Instant since = rangeStart(range);
        return snapshotRepository.findByCarUserIdAndRecordedAtAfterOrderByRecordedAtAsc(userId, since)
                .stream()
                .map(s -> new ValueHistoryPoint(s.getRecordedAt(), s.getValue()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CarResponse> mostValuable(UUID userId, int limit) {
        return carRepository.findByUserId(userId).stream()
                .sorted(Comparator.comparing(Car::getEstimatedValue).reversed())
                .limit(limit)
                .map(CarResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<BreakdownItem> byBrand(UUID userId) {
        return breakdown(carRepository.findByUserId(userId), car -> car.getBrand().getName());
    }

    @Transactional(readOnly = true)
    public List<BreakdownItem> byScale(UUID userId) {
        return breakdown(carRepository.findByUserId(userId), car -> car.getScale() != null ? car.getScale() : "Unknown");
    }

    @Transactional(readOnly = true)
    public List<BreakdownItem> byYear(UUID userId) {
        return breakdown(carRepository.findByUserId(userId), car -> car.getYear() != null ? car.getYear().toString() : "Unknown");
    }

    @Transactional(readOnly = true)
    public List<BreakdownItem> byCondition(UUID userId) {
        return breakdown(carRepository.findByUserId(userId), car -> car.getCondition().name());
    }

    @Transactional(readOnly = true)
    public List<BreakdownItem> byPackaging(UUID userId) {
        return breakdown(carRepository.findByUserId(userId), car -> car.getPackagingCondition().name());
    }

    @Transactional(readOnly = true)
    public List<BreakdownItem> byHuntType(UUID userId) {
        return breakdown(carRepository.findByUserId(userId),
                car -> car.getHuntType() != null ? car.getHuntType().name() : "NORMAL");
    }

    @Transactional(readOnly = true)
    public List<CarResponse> topGainers(UUID userId, int limit) {
        return carRepository.findByUserId(userId).stream()
                .sorted(Comparator.comparing(this::gain).reversed())
                .limit(limit)
                .map(CarResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CarResponse> topLosers(UUID userId, int limit) {
        return carRepository.findByUserId(userId).stream()
                .sorted(Comparator.comparing(this::gain))
                .limit(limit)
                .map(CarResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AcquisitionPoint> acquisitions(UUID userId) {
        Map<String, Long> counts = carRepository.findByUserId(userId).stream()
                .collect(Collectors.groupingBy(this::acquisitionMonth, Collectors.summingLong(Car::getQuantity)));

        List<AcquisitionPoint> points = new ArrayList<>();
        LocalDate cursor = LocalDate.now().withDayOfMonth(1).minusMonths(11);
        for (int i = 0; i < 12; i++) {
            String key = cursor.format(DateTimeFormatter.ofPattern("yyyy-MM"));
            points.add(new AcquisitionPoint(key, counts.getOrDefault(key, 0L)));
            cursor = cursor.plusMonths(1);
        }
        return points;
    }

    private BigDecimal gain(Car car) {
        return car.getEstimatedValue().subtract(car.getPurchasePrice());
    }

    private String acquisitionMonth(Car car) {
        LocalDate date = car.getPurchaseDate() != null ? car.getPurchaseDate() : car.getCreatedAt().atZone(ZoneOffset.UTC).toLocalDate();
        return date.format(DateTimeFormatter.ofPattern("yyyy-MM"));
    }

    private List<BreakdownItem> breakdown(List<Car> cars, Function<Car, String> classifier) {
        long total = cars.size();
        Map<String, Long> counts = cars.stream()
                .collect(Collectors.groupingBy(classifier, Collectors.counting()));

        return counts.entrySet().stream()
                .map(e -> new BreakdownItem(
                        e.getKey(),
                        e.getValue(),
                        total == 0 ? BigDecimal.ZERO : BigDecimal.valueOf(e.getValue())
                                .divide(BigDecimal.valueOf(total), 4, RoundingMode.HALF_UP)
                                .multiply(BigDecimal.valueOf(100))
                                .setScale(1, RoundingMode.HALF_UP)))
                .sorted(Comparator.comparing(BreakdownItem::count).reversed())
                .toList();
    }

    private BigDecimal sum(List<Car> cars, Function<Car, BigDecimal> extractor) {
        return cars.stream().map(extractor).reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private Instant rangeStart(String range) {
        Instant now = Instant.now();
        return switch (range == null ? "ALL" : range.toUpperCase()) {
            case "7D" -> now.minus(7, ChronoUnit.DAYS);
            case "1M" -> now.minus(30, ChronoUnit.DAYS);
            case "6M" -> now.minus(182, ChronoUnit.DAYS);
            case "1Y" -> now.minus(365, ChronoUnit.DAYS);
            default -> Instant.EPOCH;
        };
    }
}
