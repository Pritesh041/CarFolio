package com.carfolio.identification;

import com.carfolio.identification.dto.IdentificationResponse;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/identify")
public class IdentificationController {

    private final IdentificationService identificationService;

    public IdentificationController(IdentificationService identificationService) {
        this.identificationService = identificationService;
    }

    @PostMapping
    public IdentificationResponse identify(@RequestParam("file") MultipartFile file) {
        return identificationService.identify(file);
    }
}
