package com.carfolio.trade;

import com.carfolio.car.Car;
import com.carfolio.car.CarRepository;
import com.carfolio.car.CarValueSnapshot;
import com.carfolio.car.CarValueSnapshotRepository;
import com.carfolio.chat.ChatService;
import com.carfolio.chat.Conversation;
import com.carfolio.collection.CollectionCarRepository;
import com.carfolio.common.exception.ConflictException;
import com.carfolio.common.exception.NotFoundException;
import com.carfolio.notification.NotificationService;
import com.carfolio.notification.NotificationType;
import com.carfolio.trade.dto.TradeRequest;
import com.carfolio.trade.dto.TradeResponse;
import com.carfolio.user.User;
import com.carfolio.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class TradeService {

    private final TradeRepository tradeRepository;
    private final TradeItemRepository tradeItemRepository;
    private final CarRepository carRepository;
    private final CarValueSnapshotRepository carValueSnapshotRepository;
    private final CollectionCarRepository collectionCarRepository;
    private final UserRepository userRepository;
    private final ChatService chatService;
    private final NotificationService notificationService;

    public TradeService(TradeRepository tradeRepository,
                         TradeItemRepository tradeItemRepository,
                         CarRepository carRepository,
                         CarValueSnapshotRepository carValueSnapshotRepository,
                         CollectionCarRepository collectionCarRepository,
                         UserRepository userRepository,
                         ChatService chatService,
                         NotificationService notificationService) {
        this.tradeRepository = tradeRepository;
        this.tradeItemRepository = tradeItemRepository;
        this.carRepository = carRepository;
        this.carValueSnapshotRepository = carValueSnapshotRepository;
        this.collectionCarRepository = collectionCarRepository;
        this.userRepository = userRepository;
        this.chatService = chatService;
        this.notificationService = notificationService;
    }

    @Transactional
    public TradeResponse propose(User initiator, TradeRequest request) {
        User recipient = userRepository.findByUsername(request.recipientUsername())
                .orElseThrow(() -> new NotFoundException("USER_NOT_FOUND", "User not found"));
        if (recipient.getId().equals(initiator.getId())) {
            throw new ConflictException("CANNOT_TRADE_SELF", "You can't propose a trade with yourself");
        }

        Car requestedCar = carRepository.findById(request.requestedCarId())
                .orElseThrow(() -> new NotFoundException("CAR_NOT_FOUND", "Car not found"));
        if (!requestedCar.getUser().getId().equals(recipient.getId())) {
            throw new ConflictException("CAR_NOT_OWNED", "That car doesn't belong to this user");
        }

        List<Car> offeredCars = carRepository.findAllById(request.offeredCarIds());
        if (offeredCars.size() != request.offeredCarIds().size()
                || offeredCars.stream().anyMatch(car -> !car.getUser().getId().equals(initiator.getId()))) {
            throw new ConflictException("CAR_NOT_OWNED", "You can only offer cars you own");
        }

        Trade trade = new Trade();
        trade.setInitiator(initiator);
        trade.setRecipient(recipient);
        trade.setStatus(TradeStatus.PROPOSED);
        trade = tradeRepository.save(trade);

        addItem(trade, requestedCar, recipient);
        for (Car car : offeredCars) {
            addItem(trade, car, initiator);
        }

        Conversation conversation = chatService.findOrCreateConversation(initiator, recipient);
        String note = request.message() != null && !request.message().isBlank()
                ? " — \"" + request.message() + "\""
                : "";
        String offerDescription = offeredCars.get(0).getModel()
                + (offeredCars.size() > 1 ? " (+" + (offeredCars.size() - 1) + " more)" : "");
        chatService.sendMessage(conversation, initiator,
                "I'd like to propose a trade: my " + offerDescription + " for your " + requestedCar.getModel() + note,
                true);

        notificationService.notify(recipient, NotificationType.TRADE_PROPOSED,
                "New trade proposal from " + initiator.getName(),
                "Their " + offerDescription + " for your " + requestedCar.getModel(),
                "/trades");

        return TradeResponse.from(trade, tradeItemRepository.findByTradeId(trade.getId()));
    }

    private void addItem(Trade trade, Car car, User offeredBy) {
        TradeItem item = new TradeItem();
        item.setTrade(trade);
        item.setCar(car);
        item.setOfferedBy(offeredBy);
        item.setEstimatedValueAtTrade(car.getEstimatedValue());
        tradeItemRepository.save(item);
    }

    @Transactional(readOnly = true)
    public List<TradeResponse> listForUser(UUID userId) {
        return tradeRepository.findByInitiatorIdOrRecipientIdOrderByCreatedAtDesc(userId, userId)
                .stream()
                .map(trade -> TradeResponse.from(trade, tradeItemRepository.findByTradeId(trade.getId())))
                .toList();
    }

    @Transactional
    public TradeResponse updateStatus(UUID userId, UUID tradeId, TradeStatus status) {
        Trade trade = tradeRepository.findById(tradeId)
                .orElseThrow(() -> new NotFoundException("TRADE_NOT_FOUND", "Trade not found"));

        boolean isInitiator = trade.getInitiator().getId().equals(userId);
        boolean isRecipient = trade.getRecipient().getId().equals(userId);
        if (!isInitiator && !isRecipient) {
            throw new NotFoundException("TRADE_NOT_FOUND", "Trade not found");
        }
        if (status == TradeStatus.CANCELLED && !isInitiator) {
            throw new ConflictException("TRADE_ACTION_NOT_ALLOWED", "Only the initiator can cancel a trade");
        }
        if ((status == TradeStatus.ACCEPTED || status == TradeStatus.DECLINED) && !isRecipient) {
            throw new ConflictException("TRADE_ACTION_NOT_ALLOWED", "Only the recipient can accept or decline a trade");
        }
        if (trade.getStatus() != TradeStatus.PROPOSED) {
            throw new ConflictException("TRADE_NOT_PROPOSED", "This trade has already been resolved");
        }

        List<TradeItem> items = tradeItemRepository.findByTradeId(trade.getId());
        if (status == TradeStatus.ACCEPTED) {
            acceptTrade(trade, items);
        } else {
            trade.setStatus(status);
        }

        User otherParty = isInitiator ? trade.getRecipient() : trade.getInitiator();
        notificationService.notify(otherParty, NotificationType.TRADE_UPDATED,
                "Trade " + status.name().toLowerCase(),
                status == TradeStatus.ACCEPTED
                        ? "The cars have swapped hands."
                        : "The trade proposal was " + status.name().toLowerCase() + ".",
                "/trades");

        return TradeResponse.from(trade, items);
    }

    private void acceptTrade(Trade trade, List<TradeItem> items) {
        for (TradeItem item : items) {
            Car car = item.getCar();
            User newOwner = item.getOfferedBy().getId().equals(trade.getInitiator().getId())
                    ? trade.getRecipient()
                    : trade.getInitiator();
            car.setUser(newOwner);
            carRepository.save(car);

            CarValueSnapshot snapshot = new CarValueSnapshot();
            snapshot.setCar(car);
            snapshot.setValue(car.getEstimatedValue());
            carValueSnapshotRepository.save(snapshot);

            collectionCarRepository.deleteByCarId(car.getId());
        }

        trade.setStatus(TradeStatus.COMPLETED);

        Conversation conversation = chatService.findOrCreateConversation(trade.getInitiator(), trade.getRecipient());
        chatService.sendMessage(conversation, trade.getRecipient(),
                "Trade accepted — the cars have swapped hands. Let's arrange the handover!",
                true);
    }
}
