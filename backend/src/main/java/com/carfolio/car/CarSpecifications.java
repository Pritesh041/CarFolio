package com.carfolio.car;

import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public final class CarSpecifications {

    private CarSpecifications() {}

    public static Specification<Car> matching(UUID userId, CarFilter filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("user").get("id"), userId));

            if (filter.brandId() != null) {
                predicates.add(cb.equal(root.get("brand").get("id"), filter.brandId()));
            }
            if (filter.model() != null && !filter.model().isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("model")), "%" + filter.model().toLowerCase() + "%"));
            }
            if (filter.year() != null) {
                predicates.add(cb.equal(root.get("year"), filter.year()));
            }
            if (filter.series() != null && !filter.series().isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("series")), "%" + filter.series().toLowerCase() + "%"));
            }
            if (filter.scale() != null && !filter.scale().isBlank()) {
                predicates.add(cb.equal(root.get("scale"), filter.scale()));
            }
            if (filter.color() != null && !filter.color().isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("color")), "%" + filter.color().toLowerCase() + "%"));
            }
            if (filter.condition() != null) {
                predicates.add(cb.equal(root.get("condition"), filter.condition()));
            }
            if (filter.packagingCondition() != null) {
                predicates.add(cb.equal(root.get("packagingCondition"), filter.packagingCondition()));
            }
            if (filter.minPurchasePrice() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("purchasePrice"), filter.minPurchasePrice()));
            }
            if (filter.maxPurchasePrice() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("purchasePrice"), filter.maxPurchasePrice()));
            }
            if (filter.minValue() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("estimatedValue"), filter.minValue()));
            }
            if (filter.maxValue() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("estimatedValue"), filter.maxValue()));
            }
            if (filter.q() != null && !filter.q().isBlank()) {
                String like = "%" + filter.q().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("model")), like),
                        cb.like(cb.lower(root.get("variant")), like),
                        cb.like(cb.lower(root.get("series")), like)
                ));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
