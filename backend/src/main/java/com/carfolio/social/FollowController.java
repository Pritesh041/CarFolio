package com.carfolio.social;

import com.carfolio.security.UserPrincipal;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users/{username}/follow")
public class FollowController {

    private final FollowService followService;

    public FollowController(FollowService followService) {
        this.followService = followService;
    }

    @PostMapping
    public ResponseEntity<Void> follow(@AuthenticationPrincipal UserPrincipal principal, @PathVariable String username) {
        followService.follow(principal.getUser(), username);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> unfollow(@AuthenticationPrincipal UserPrincipal principal, @PathVariable String username) {
        followService.unfollow(principal.getUser(), username);
        return ResponseEntity.noContent().build();
    }
}
