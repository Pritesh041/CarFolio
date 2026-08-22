package com.carfolio.marketplace;

import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public final class ListingSpecifications {

    private ListingSpecifications() {}

    public static Specification<Listing> matching(ListingFilter filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("status"), ListingStatus.ACTIVE));

            if (filter.brandId() != null) {
                predicates.add(cb.equal(root.get("car").get("brand").get("id"), filter.brandId()));
            }
            if (filter.scale() != null && !filter.scale().isBlank()) {
                predicates.add(cb.equal(root.get("car").get("scale"), filter.scale()));
            }
            if (filter.condition() != null) {
                predicates.add(cb.equal(root.get("condition"), filter.condition()));
            }
            if (filter.minPrice() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("price"), filter.minPrice()));
            }
            if (filter.maxPrice() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("price"), filter.maxPrice()));
            }
            if (filter.q() != null && !filter.q().isBlank()) {
                String like = "%" + filter.q().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("car").get("model")), like),
                        cb.like(cb.lower(root.get("car").get("variant")), like),
                        cb.like(cb.lower(root.get("car").get("series")), like)
                ));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
