package com.carfolio.social;

import com.carfolio.security.UserPrincipal;
import com.carfolio.social.dto.CommunityFeedResponse;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/community")
public class CommunityController {

    private final CommunityService communityService;

    public CommunityController(CommunityService communityService) {
        this.communityService = communityService;
    }

    @GetMapping("/feed")
    public CommunityFeedResponse feed(@AuthenticationPrincipal UserPrincipal principal) {
        return communityService.feed(principal.getId());
    }
}
