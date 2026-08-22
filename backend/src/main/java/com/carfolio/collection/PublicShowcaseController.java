package com.carfolio.collection;

import com.carfolio.collection.dto.DiscoverResponse;
import com.carfolio.collection.dto.PublicShowcaseResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/public")
public class PublicShowcaseController {

    private final CollectionService collectionService;

    public PublicShowcaseController(CollectionService collectionService) {
        this.collectionService = collectionService;
    }

    @GetMapping("/showcase/{username}/{slug}")
    public PublicShowcaseResponse getShowcase(@PathVariable String username, @PathVariable String slug) {
        return collectionService.getPublicShowcase(username, slug);
    }

    @GetMapping("/discover")
    public DiscoverResponse discover() {
        return collectionService.discover();
    }
}
