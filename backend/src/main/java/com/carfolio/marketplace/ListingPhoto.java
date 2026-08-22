package com.carfolio.marketplace;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "listing_photos")
@Getter
@Setter
public class ListingPhoto {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "listing_id", nullable = false)
    private Listing listing;

    @Column(nullable = false, columnDefinition = "text")
    private String url;

    @Column(nullable = false)
    private Integer position = 0;

    @Column(name = "is_primary", nullable = false, columnDefinition = "boolean not null default false")
    private boolean primary = false;
}
