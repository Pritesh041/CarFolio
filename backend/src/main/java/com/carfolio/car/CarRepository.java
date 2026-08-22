package com.carfolio.car;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface CarRepository extends JpaRepository<Car, UUID>, JpaSpecificationExecutor<Car> {

    List<Car> findByUserId(UUID userId);

    @Query("select c.brand.name from Car c where c.user.id = :userId group by c.brand.id, c.brand.name order by count(c) desc")
    List<String> findFavoriteBrandNames(@Param("userId") UUID userId, Pageable pageable);
}
