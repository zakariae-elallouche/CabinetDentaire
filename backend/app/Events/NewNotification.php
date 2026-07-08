<?php

namespace App\Events;

use App\Models\Notification;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewNotification implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public array $notification;
    public int $userId;

    public function __construct(Notification $notification)
    {
        $this->userId = $notification->utilisateur_id;
        $this->notification = [
            'id'         => $notification->id,
            'type'       => $notification->type,
            'titre'      => $notification->titre,
            'message'    => $notification->message,
            'donnees'    => $notification->donnees,
            'lu'         => $notification->lu,
            'created_at' => $notification->created_at?->toISOString(),
        ];
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('notifications.' . $this->userId),
        ];
    }
}
