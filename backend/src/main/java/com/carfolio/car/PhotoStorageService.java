package com.carfolio.car;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.util.Base64;

@Service
public class PhotoStorageService {

    public String store(MultipartFile file) {
        String contentType = file.getContentType() != null ? file.getContentType() : "image/jpeg";
        try {
            String base64 = Base64.getEncoder().encodeToString(file.getBytes());
            return "data:" + contentType + ";base64," + base64;
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }
}
